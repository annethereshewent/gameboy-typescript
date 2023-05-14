import { Memory } from "../cpu/Memory"
import { InterruptRequestRegister } from "../cpu/memory_registers/InterruptRequestRegister"
import { getBit, resetBit } from "../misc/BitOperations"
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
    const maxObjectsPerLine = 10

    const { lineYRegister, lcdControlRegister } = this.registers

    const tileMapStartAddress = 0x8000

    const sortedSprites = this.oamTable.entries.sort((a, b) => a.xPosition - b.xPosition)

    let numSprites = 0
    for (const sprite of sortedSprites) {
      if (numSprites === maxObjectsPerLine) {
        break
      }
      const yPos = sprite.yPosition - 16
      const xPos = sprite.xPosition - 8
      let intersection = lineYRegister.value - yPos

      if (sprite.isYFlipped) {
        intersection = lcdControlRegister.objSize() - 1 - intersection
      }

      if (intersection <  0 || intersection > lcdControlRegister.objSize()-1) {
        continue
      }

      const tileIndex = lcdControlRegister.objSize() === 16 ? resetBit(sprite.tileIndex, 7) : sprite.tileIndex

      const tileBytePosition = tileIndex * 16
      const tileYBytePosition = intersection * 2

      const tileAddress = tileBytePosition + tileYBytePosition + tileMapStartAddress

      const lowerByte = this.memory.readByte(tileAddress)
      const upperByte = this.memory.readByte(tileAddress+1)

      const paletteColors = sprite.paletteNumber === 0 ? this.registers.objectPaletteRegister0.colors : this.registers.objectPaletteRegister1.colors


      for (let i = 0; i < 8; i++) {
        const bitPos = sprite.isXFlipped ? i : 7 - i

        const lowerBit = getBit(lowerByte, bitPos)
        const upperBit = getBit(upperByte, bitPos) << 1

        const paletteIndex = lowerBit + upperBit

        if (paletteIndex === 0 || (xPos + i) < 0) {
          continue
        }

        const colorIndex = paletteColors[paletteIndex]

        const color = this.colors[colorIndex]

        const backgroundVisible = this.backgroundPixelsDrawn[xPos + i]
        const windowVisible = this.windowPixelsDrawn[xPos + i]

        if (!(sprite.bgAndWindowOverObj && (windowVisible || backgroundVisible))) {
          this.drawPixel(xPos + i, lineYRegister.value, color.red, color.green, color.blue)
        }
      }

      numSprites++
    }
  }

  drawBackgroundLine() {
    this.backgroundPixelsDrawn = []
    const { lineYRegister, lcdControlRegister, scrollXRegister, scrollYRegister } = this.registers
    const tileDataAddress = lcdControlRegister.bgAndWindowTileDataArea()

    const offset = tileDataAddress === 0x8800 ? 128 : 0

    const memoryRead = (address: number) => tileDataAddress === 0x8800 ? this.memory.readSignedByte(address) : this.memory.readByte(address)

    const paletteColors = this.registers.backgroundPaletteRegister.colors

    for (let x = 0; x < GPU.screenWidth; x++) {
      const scrolledX = (scrollXRegister.value + x) & 0xff
      const scrolledY = (scrollYRegister.value + lineYRegister.value) & 0xff
      const tileMapIndex = (Math.floor(scrolledY / 8) * 32 + Math.floor(scrolledX / 8))

      const yPosInTile = scrolledY % 8
      const xPosInTile = scrolledX % 8

      const tileBytePosition  = yPosInTile * 2

      // we need to multiply by 16 since it takes 16 bytes to represent one tile.
      // you need two bytes to represent one row of a tile. 16 bytes total for all 8 rows.
      const tileByteIndex = memoryRead(lcdControlRegister.bgTileMapArea()  + tileMapIndex) + offset
      const tileLineAddress = tileDataAddress + (tileByteIndex * 16) + tileBytePosition

      const lowerByte = this.memory.readByte(tileLineAddress)
      const upperByte = this.memory.readByte(tileLineAddress + 1)

      const bitIndex = 7 - xPosInTile

      const lowerBit = getBit(lowerByte, bitIndex)
      const upperBit = getBit(upperByte, bitIndex) << 1

      const paletteIndex = lowerBit + upperBit

      const colorIndex = paletteColors[paletteIndex]

      const color = this.colors[colorIndex]

      this.backgroundPixelsDrawn.push(paletteIndex !== 0)

      this.drawPixel(x, lineYRegister.value, color.red, color.green, color.blue)
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
        x++
        continue
      }
      const xPos = x - adjustedWindowX
      const yPos = lineYRegister.value - windowYRegister.value

      const tileMapIndex = (Math.floor(xPos / 8)) + (Math.floor(yPos / 8) * 32)

      const yPosInTile = yPos % 8

      // 2 bytes are needed to represent one line in a tile
      const tileBytePosition = yPosInTile * 2

      const tileByteIndex = memoryRead(tileMapAddress + tileMapIndex) + offset

      // 2 bytes are needed to represent one line in a tile, 8 lines total means 16 bytes to represent one tile.
      const tileLineAddress = windowDataAddress + (tileByteIndex * 16) + tileBytePosition

      const lowerByte = this.memory.readByte(tileLineAddress)
      const upperByte = this.memory.readByte(tileLineAddress + 1)

      for (let i = 7; i >= 0; i--) {
        const lowerBit = getBit(lowerByte, i)
        const upperBit = getBit(upperByte, i) << 1

        const paletteIndex = lowerBit + upperBit
        const colorIndex = paletteColors[paletteIndex]

        const color = this.colors[colorIndex]

        this.windowPixelsDrawn.push(paletteIndex !== 0)

        this.drawPixel(x, lineYRegister.value, color.red, color.green, color.blue)
        x++
      }
    }
  }

  drawPixel(x: number, y: number, r: number, g: number, b: number, alpha: number = 0xff) {
    const pos = (x * 4) + (y * this.screen.width * 4)

    this.screen.data[pos] = r
    this.screen.data[pos + 1] = g
    this.screen.data[pos + 2] = b
    this.screen.data[pos + 3] = alpha
  }
}