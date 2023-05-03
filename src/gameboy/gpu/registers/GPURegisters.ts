import { Memory } from "../../cpu/Memory"
import { GPURegister } from "./GPURegister"
import { LCDStatusRegister } from "./lcd_status/LCDStatusRegister"

export class GPURegisters {
  memory: Memory

  lcdStatusRegister: LCDStatusRegister
  lineYRegister: GPURegister

  constructor(memory: Memory) {
    this.memory = memory

    this.lcdStatusRegister = new LCDStatusRegister(0xff41, memory)
    this.lineYRegister = new GPURegister(0xff44, memory)
  }
}

