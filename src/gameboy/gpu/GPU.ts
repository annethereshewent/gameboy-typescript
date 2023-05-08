import { Gameboy } from "../Gameboy"
import { Memory } from "../cpu/Memory"
import { InterruptRequestRegister } from "../cpu/memory_registers/InterruptRequestRegister"
import { GPURegisters } from "./registers/GPURegisters"
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
  // dark mode
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

  constructor(memory: Memory) {
    this.memory = memory
    this.registers = new GPURegisters(memory)
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

  }

  drawBackgroundLine() {
    const { lineYRegister, lcdControlRegister } = this.registers
    const tileDataAddress = lcdControlRegister.bgAndWindowTileDataArea()

    const offset = tileDataAddress === 0x8800 ? 128 : 0

    const memoryRead = (address: number) => tileDataAddress === 0x8800 ? this.memory.readSignedByte(address) : this.memory.readByte(address)

    const paletteColors = this.registers.backgroundPaletteRegister.colors

    let x = 0
    while (x < GPU.screenWidth) {
      const tileMapIndex = (Math.floor(lineYRegister.value / 8) * 32 + Math.floor(x / 8))

      const yPosInTile = lineYRegister.value % 8

      const tileBytePosition  = yPosInTile * 2

      // we need to multiply by 16 since it takes 16 bytes to represent one tile
      // you need two bytes to represent one row of a tile. 16 bytes total for all 8 rows.
      const tileByteIndex = memoryRead(lcdControlRegister.bgTileMapArea()  + tileMapIndex) + offset
      const tileLineAddress = tileDataAddress + (tileByteIndex * 16) + tileBytePosition

      // get the upper and lower bytes of the tile
      const lowerByte = this.memory.readByte(tileLineAddress)
      const upperByte = this.memory.readByte(tileLineAddress + 1)

      for (let i = 7; i >= 0; i--) {
        const lowerBit = this.getBit(lowerByte, i)
        const upperBit = this.getBit(upperByte, i) << 1

        const colorIndex = paletteColors[lowerBit + upperBit]

        const color = this.colors[colorIndex]

        this.drawPixel(x, lineYRegister.value, color.red, color.green, color.blue)
        x++
      }
    }
  }

  drawWindowLine() {

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