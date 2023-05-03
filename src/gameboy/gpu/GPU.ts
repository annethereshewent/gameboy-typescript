import { Memory } from "../cpu/Memory"
import { GPURegisters } from "./registers/GPURegisters"
import { LCDStatusMode } from "./registers/lcd_status/LCDStatusMode"

export class GPU {
  static screenWidth = 160
  static screenHeight = 144
  static offscreenHeight = 154

  memory: Memory
  registers: GPURegisters

  constructor(memory: Memory) {
    this.memory = memory
    this.registers = new GPURegisters(memory)
  }

  step() {
    switch (this.registers.lcdStatusRegister.mode) {
      case LCDStatusMode.InHBlank:
        this.registers.lineYRegister.value++

        if (this.registers.lineYRegister.value === GPU.screenHeight) {
          this.registers.lcdStatusRegister.mode = LCDStatusMode.InVBlank
        } else {
          this.registers.lcdStatusRegister.mode = LCDStatusMode.SearchingOAM
        }
        break
      case LCDStatusMode.InVBlank:
        this.registers.lineYRegister.value++

        if (this.registers.lineYRegister.value === GPU.offscreenHeight) {
          this.registers.lcdStatusRegister.mode = LCDStatusMode.SearchingOAM
          this.registers.lineYRegister.value = 0
        }
        break
      case LCDStatusMode.SearchingOAM:
        this.registers.lcdStatusRegister.mode = LCDStatusMode.TransferringToLCD
        break
      case LCDStatusMode.TransferringToLCD:
        this.registers.lcdStatusRegister.mode = LCDStatusMode.InHBlank
        break
    }
  }
}