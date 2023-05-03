import { Memory } from "../../cpu/Memory"
import { GPURegister } from "./GPURegister"
import { LCDControlRegister } from "./LCDControlRegister"
import { LCDStatusRegister } from "./lcd_status/LCDStatusRegister"

export class GPURegisters {
  memory: Memory

  lcdStatusRegister: LCDStatusRegister
  lineYRegister: GPURegister
  lcdControlRegister: LCDControlRegister

  constructor(memory: Memory) {
    this.memory = memory

    this.lcdStatusRegister = new LCDStatusRegister(0xff41, memory)
    this.lineYRegister = new GPURegister(0xff44, memory)
    this.lcdControlRegister = new LCDControlRegister(0xff40, memory)
  }
}

