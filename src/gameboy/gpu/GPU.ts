import { Memory } from "../cpu/Memory"
import { InterruptRequestRegister } from "../cpu/memory_registers/InterruptRequestRegister"
import { resetBit } from "../misc/BitOperations"
import { GPURegisters } from "./registers/GPURegisters"
import { OAMTable } from "./registers/OAMTable"
import { LCDMode } from "./registers/lcd_status/LCDMode"


// see http://imrannazar.com/GameBoy-Emulation-in-JavaScript:-GPU-Timings
const CYCLES_IN_HBLANK = 204
const CYCLES_IN_OAM = 80
const CYCLES_IN_VRAM = 172

const CYCLES_PER_SCANLINE = CYCLES_IN_HBLANK + CYCLES_IN_OAM + CYCLES_IN_VRAM
const CYCLES_IN_VBLANK = 4560

const SCANLINES_PER_FRAME = 144

export class GPU {
  static screenWidth = 160
  static screenHeight = 144
  static offscreenHeight = 154

  static CyclesPerFrame = (CYCLES_PER_SCANLINE * SCANLINES_PER_FRAME) + CYCLES_IN_VBLANK


  numWindowLines = 0

  windowPixelsDrawn: boolean[] = []
  backgroundPixelsDrawn: boolean[] = []

  cycles = 0

  // color is determined by the palette registers
  colors = [
    // white
    { red: 255, green: 255, blue: 255 },
    // light grey
    { red: 192, green: 192, blue: 192 },
    // gray
    { red: 96, green: 96, blue: 96 },
    // black
    { red: 0, green: 0, blue: 0 },
  ]
  // inverted mode
  // colors = [
  //   // black
  //   { red: 0, green: 0, blue: 0 },
  //   // gray
  //   { red: 96, green: 96, blue: 96 },
  //   // light grey
  //   { red: 192, green: 192, blue: 192 },
  //   // white
  //   { red: 255, green: 255, blue: 255 },
  // ]
  // original green colors
  // colors = [
  //   // lightest green
  //   { red: 155, green: 188, blue: 15 },
  //   // light green
  //   { red: 139, green: 172, blue: 15 },
  //   // green
  //   { red: 48, green: 98, blue: 48 },
  //   // dark green
  //   { red: 15, green: 56, blue: 15 },
  // ]

  memory: Memory
  registers: GPURegisters

  screen = new ImageData(GPU.screenWidth, GPU.screenHeight)

  oamTable: OAMTable

  constructor(memory: Memory) {
    this.memory = memory
    this.registers = new GPURegisters(memory)
    this.oamTable = new OAMTable(memory)
  }

  step(cycles: number) {
    const interruptRequestRegister = new InterruptRequestRegister(this.memory)

    this.cycles += cycles
    switch (this.registers.lcdStatusRegister.mode) {
      case LCDMode.HBlank:
        if (this.cycles >= CYCLES_IN_HBLANK) {
          this.registers.lineYRegister.value++

          if (this.registers.lineYRegister.value === GPU.screenHeight) {
            this.registers.lcdStatusRegister.mode = LCDMode.VBlank

            interruptRequestRegister.triggerVBlankRequest()
          } else {
            this.registers.lcdStatusRegister.mode = LCDMode.SearchingOAM
          }

          this.cycles %= CYCLES_IN_HBLANK
        }
        break
      case LCDMode.VBlank:
        if (this.cycles >= CYCLES_PER_SCANLINE) {
          this.registers.lcdStatusRegister.lineYCompareMatching = this.registers.lineYCompareRegister.value === this.registers.lineYRegister.value ? 1 : 0

          if (this.registers.lcdStatusRegister.isLineYCompareMatching() && this.registers.lcdStatusRegister.isLineYMatchingInerruptSelected()) {
            interruptRequestRegister.triggerLcdStatRequest()
          }

          this.registers.lineYRegister.value++

          if (this.registers.lineYRegister.value === GPU.offscreenHeight) {
            this.registers.lcdStatusRegister.mode = LCDMode.SearchingOAM
            this.registers.lineYRegister.value = 0
            this.numWindowLines = 0
          }

          this.cycles %= CYCLES_PER_SCANLINE
        }

        break
      case LCDMode.SearchingOAM:
        if (this.cycles >= CYCLES_IN_OAM) {
          this.registers.lcdStatusRegister.mode = LCDMode.TransferringToLCD

          this.cycles %= CYCLES_IN_OAM
        }
        break
      case LCDMode.TransferringToLCD:
        if (this.cycles >= CYCLES_IN_VRAM) {
          this.drawLine()
          const { lcdStatusRegister } = this.registers

          if (lcdStatusRegister.isHBlankInterruptSelected() || lcdStatusRegister.isVBlankInterruptSelected() || lcdStatusRegister.isOamInterruptSelected()) {
            interruptRequestRegister.triggerLcdStatRequest()
          }

          this.registers.lcdStatusRegister.lineYCompareMatching = this.registers.lineYCompareRegister.value === this.registers.lineYRegister.value ? 1 : 0

          if (this.registers.lcdStatusRegister.isLineYCompareMatching() && this.registers.lcdStatusRegister.isLineYCompareMatching()) {
            interruptRequestRegister.triggerLcdStatRequest()
          }

          this.registers.lcdStatusRegister.mode = LCDMode.HBlank

          this.cycles %= CYCLES_IN_VRAM
        }
        break
    }
  }

  drawLine() {
    const { lcdControlRegister } = this.registers
    if (!lcdControlRegister.isLCDControllerOn()) {
      return
    }

    if (lcdControlRegister.isBackgroundOn()) {
      this.drawBackgroundLine()
    }

    if (lcdControlRegister.isWindowOn()) {
      this.drawWindowLine()
    }

    if (lcdControlRegister.isObjOn()) {
      this.drawSpriteLine()
    }
  }

  drawSpriteLine() {
    // per docs https://gbdev.io/pandocs/OAM.html, only 10 sprites can be visible per scan line
    const maxObjectsPerLine = 10

    const { lineYRegister, lcdControlRegister } = this.registers

    // per the docs above, tilemap for sprites is located at 0x8000-0x8fff
    const tileMapStartAddress = 0x8000

    // these are sprites that are available to be drawn at current lineY
    const availableSprites = this.oamTable.entries.filter((entry) => {
      // per https://gbdev.io/pandocs/OAM.html, sprite Y's position has an offset of 16, and sprite X
      // has an offset of 8. So whatever value the registers have, subtract either 8 or 16 to
      // get the actual position on the screen.
      const yPos = entry.yPosition - 16

      let intersection = lineYRegister.value - yPos

      if (entry.isYFlipped) {
        intersection = lcdControlRegister.objSize() - 1 - intersection
      }

      return intersection >= 0 && intersection <= lcdControlRegister.objSize() - 1
    })
    .slice(0, maxObjectsPerLine)
    .sort((a, b) => a.xPosition - b.xPosition)

    for (const sprite of availableSprites) {
      const spriteX = sprite.xPosition - 8
      const spriteY = sprite.yPosition - 16


      // this tells us where in the sprite tile the y-coordinate is in.
      let intersection = lineYRegister.value - spriteY

      // start from the bottom of the sprite tile if flipped
      if (sprite.isYFlipped) {
        intersection = lcdControlRegister.objSize() - 1 - intersection
      }
      const tileIndex = lcdControlRegister.objSize() === 16 ? resetBit(sprite.tileIndex, 7) : sprite.tileIndex

      const tileBytePosition = intersection * 2
      const tileStartIndex = tileIndex * 16 // 16 bytes per tile, takes 2 bits to encode one line, 8 lines total

      const tileAddress = tileMapStartAddress + tileBytePosition + tileStartIndex

      // finally get upper and lower bytes and render the sprite
      const lowerByte = this.memory.readByte(tileAddress)
      const upperByte = this.memory.readByte(tileAddress+1)


      for (let i = 7; i >= 0; i--) {
        const bitPos = sprite.isXFlipped ? i : 7 - i

        const lowerBit = this.getBit(lowerByte, bitPos)
        const upperBit = this.getBit(upperByte, bitPos) << 1


        const paletteColors = sprite.paletteNumber === 0 ? this.registers.objectPaletteRegister0.colors : this.registers.objectPaletteRegister1.colors

        const colorIndex = paletteColors[lowerBit + upperBit]

        const color = this.colors[colorIndex]

        // TODO: add check to see if sprite is behind background
        const windowVisible = this.windowPixelsDrawn[spriteX + i]
        const backgroundVisible = this.backgroundPixelsDrawn[spriteX + i]

        const isPixelBehindBackground = sprite.bgAndWindowOverObj === 1 && (backgroundVisible || windowVisible)

        if (!isPixelBehindBackground) {
          this.drawPixel(spriteX + i, lineYRegister.value, color.red, color.green, color.blue)
        }
      }
    }

  }

  drawBackgroundLine() {
    this.backgroundPixelsDrawn = []
    const { lineYRegister, lcdControlRegister, scrollXRegister, scrollYRegister } = this.registers
    const tileDataAddress = lcdControlRegister.bgAndWindowTileDataArea()

    const offset = tileDataAddress === 0x8800 ? 128 : 0

    const memoryRead = (address: number) => tileDataAddress === 0x8800 ? this.memory.readSignedByte(address) : this.memory.readByte(address)

    const paletteColors = this.registers.backgroundPaletteRegister.colors

    let x = 0
    while (x < GPU.screenWidth) {
      const scrolledX = scrollXRegister.value + x
      const scrolledY = scrollYRegister.value = lineYRegister.value
      const tileMapIndex = (Math.floor(scrolledY / 8) * 32 + Math.floor(scrolledX / 8))

      const yPosInTile = scrolledY % 8

      const tileBytePosition  = yPosInTile * 2

      // we need to multiply by 16 since it takes 16 bytes to represent one tile.
      // you need two bytes to represent one row of a tile. 16 bytes total for all 8 rows.
      const tileByteIndex = memoryRead(lcdControlRegister.bgTileMapArea()  + tileMapIndex) + offset
      const tileLineAddress = tileDataAddress + (tileByteIndex * 16) + tileBytePosition

      const lowerByte = this.memory.readByte(tileLineAddress)
      const upperByte = this.memory.readByte(tileLineAddress + 1)

      for (let i = 7; i >= 0; i--) {
        const lowerBit = this.getBit(lowerByte, i)
        const upperBit = this.getBit(upperByte, i) << 1

        const paletteIndex = lowerBit + upperBit

        const colorIndex = paletteColors[paletteIndex]

        const color = this.colors[colorIndex]

        this.backgroundPixelsDrawn.push(paletteIndex !== 0)

        this.drawPixel(x, lineYRegister.value, color.red, color.green, color.blue)
        x++
      }
    }
  }

  drawWindowLine() {
    this.windowPixelsDrawn = []
    const {
      lineYRegister,
      lcdControlRegister,
      windowXRegister,
      windowYRegister
    } = this.registers

    // no need to render anything if we're not at a line where the window starts
    if (lineYRegister.value < windowYRegister.value) {
      return
    }

    const windowDataAddress = lcdControlRegister.bgAndWindowTileDataArea()
    const tileMapAddress = lcdControlRegister.windowTileMapArea()

    const memoryRead = (address: number) => windowDataAddress === 0x8800 ? this.memory.readSignedByte(address) : this.memory.readByte(address)

    const paletteColors = this.registers.backgroundPaletteRegister.colors


    let x = 0

    // per gameboy docs, windowXRegister value always starts at 7, so we want to adjust for that
    let adjustedWindowX = windowXRegister.value - 7

    const offset = windowDataAddress === 0x8800 ? 128 : 0

    while (x < GPU.screenWidth) {
      if (x < adjustedWindowX) {
        this.windowPixelsDrawn.push(false)
        continue
      }
      const tileMapIndex = (Math.floor(x) / 8) + (Math.floor(this.numWindowLines) / 8) * 32

      const yPosInTile = this.numWindowLines % 8

      // 2 bytes are needed to represent one line in a tile
      const tileBytePosition = yPosInTile * 2

      const tileByteIndex = memoryRead(tileMapAddress + tileMapIndex) + offset

      // 2 bytes are needed to represent one line in a tile, 8 lines total means 16 bytes to represent one tile.
      const tileLineAddress = windowDataAddress + (tileByteIndex * 16) + tileBytePosition

      const lowerByte = this.memory.readByte(tileLineAddress)
      const upperByte = this.memory.readByte(tileLineAddress + 1)

      for (let i = 7; i >= 0; i--) {
        const lowerBit = this.getBit(lowerByte, i)
        const upperBit = this.getBit(upperByte, i) << 1

        const paletteIndex = lowerBit + upperBit
        const colorIndex = paletteColors[paletteIndex]

        const color = this.colors[colorIndex]

        this.windowPixelsDrawn.push(paletteIndex !== 0)

        this.drawPixel(x, lineYRegister.value, color.red, color.green, color.blue)
        x++
      }
    }

    // numWindowLines drawn keeps track of where we are in the window rendering
    // since the window can start at any position, but the first tile of the window
    // always starts at the top of the map regardless of where the window is on the
    // screen. hence why we need windowLinesDrawn.
    this.numWindowLines++
  }

  drawPixel(x: number, y: number, r: number, g: number, b: number, alpha: number = 0xff) {
    const pos = (x * 4) + (y * this.screen.width * 4)

    this.screen.data[pos] = r
    this.screen.data[pos + 1] = g
    this.screen.data[pos + 2] = b
    this.screen.data[pos + 3] = alpha
  }

  getBit(value: number, pos: number): number {
    return (value >> pos) & 1
  }
}