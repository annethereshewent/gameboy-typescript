import { Memory } from "../cpu/Memory"
import { InterruptRequestRegister } from "../cpu/memory_registers/InterruptRequestRegister"
import { GPURegisters } from "./registers/GPURegisters"
import { LCDMode } from "./registers/lcd_status/LCDMode"

export class GPU {
  static screenWidth = 160
  static screenHeight = 144
  static offscreenHeight = 154

  private static CyclesPerHBlank = 204
  private static CyclesPerScanlineOam = 80
  private static CyclesPerScanlineVram = 172
  private static CyclesPerScanline = GPU.CyclesPerHBlank + GPU.CyclesPerScanlineOam + GPU.CyclesPerScanlineVram
  private static CyclesPerVBlank = 4560
  private static ScanlinesPerFrame = 144
  static CyclesPerFrame = (GPU.CyclesPerScanline * GPU.ScanlinesPerFrame) + GPU.CyclesPerVBlank

  cycles = 0

  colors = [
    { red: 255, green: 255, blue: 255 },
    { red: 192, green: 192, blue: 192 },
    { red: 96, green: 96, blue: 96 },
    { red: 0, green: 0, blue: 0 },
  ]

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
        if (this.cycles >= GPU.CyclesPerHBlank) {
          this.drawLine()
          this.registers.lineYRegister.value++

          if (this.registers.lineYRegister.value === GPU.screenHeight) {
            this.registers.lcdStatusRegister.mode = LCDMode.VBlank
            interruptRequestRegister.triggerVBlankRequest()
          } else {
            this.registers.lcdStatusRegister.mode = LCDMode.SearchingOAM
          }

          this.cycles %= GPU.CyclesPerHBlank
        }
        break
      case LCDMode.VBlank:
        if (this.cycles >= GPU.CyclesPerVBlank) {
          this.registers.lcdStatusRegister.lineYCompareMatching = this.registers.lineYCompareRegister.value === this.registers.lineYRegister.value ? 1 : 0

          if (this.registers.lcdStatusRegister.isLineYCompareMatching() && this.registers.lcdStatusRegister.isLineYCompareMatching()) {
            interruptRequestRegister.triggerLcdStatRequest()
          }

          this.registers.lineYRegister.value++

          if (this.registers.lineYRegister.value === GPU.offscreenHeight) {
            this.registers.lcdStatusRegister.mode = LCDMode.SearchingOAM
            this.registers.lineYRegister.value = 0
          }

          this.cycles %= GPU.CyclesPerVBlank
        }

        break
      case LCDMode.SearchingOAM:
        if (this.cycles >= GPU.CyclesPerScanlineOam) {
          this.registers.lcdStatusRegister.mode = LCDMode.TransferringToLCD

          this.cycles %= GPU.CyclesPerScanlineOam
        }
        break
      case LCDMode.TransferringToLCD:
        if (this.cycles >= GPU.CyclesPerScanlineVram) {

          if (this.registers.lcdStatusRegister.isHBlankInterruptSelected()) {
            interruptRequestRegister.triggerLcdStatRequest()
          }

          this.registers.lcdStatusRegister.lineYCompareMatching = this.registers.lineYCompareRegister.value === this.registers.lineYRegister.value ? 1 : 0

          if (this.registers.lcdStatusRegister.isLineYCompareMatching() && this.registers.lcdStatusRegister.isLineYCompareMatching()) {
            interruptRequestRegister.triggerLcdStatRequest()
          }

          this.registers.lcdStatusRegister.mode = LCDMode.HBlank

          this.cycles %= GPU.CyclesPerScanlineVram
        }
        break
    }
  }

  drawLine() {
    const { lcdControlRegister } = this.registers
    if (lcdControlRegister.isLCDControllerOn()) {
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

  }

  drawSprinteLine() {

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
}