import { Memory } from "../../cpu/Memory"
import { BackgroundPaletteRegister } from "./BackgroundPaletteRegister"
import { GPURegister } from "./GPURegister"
import { LCDControlRegister } from "./LCDControlRegister"
import { ObjectPaletteRegister } from "./ObjectPaletteRegister"
import { LCDStatusRegister } from "./lcd_status/LCDStatusRegister"

export class GPURegisters {
  memory: Memory

  lcdStatusRegister: LCDStatusRegister
  lineYRegister: GPURegister
  lcdControlRegister: LCDControlRegister
  scrollYRegister: GPURegister
  lineYCompareRegister: GPURegister
  windowYRegister: GPURegister
  backgroundPaletteRegister: GPURegister
  objectPaletteRegister0: ObjectPaletteRegister
  objectPaletteRegister1: ObjectPaletteRegister

  constructor(memory: Memory) {
    this.memory = memory

    this.lcdStatusRegister = new LCDStatusRegister(0xff41, memory)
    this.lineYRegister = new GPURegister(0xff44, memory)
    this.lcdControlRegister = new LCDControlRegister(0xff40, memory)
    this.scrollYRegister = new GPURegister(0xff42, memory)
    this.lineYCompareRegister = new GPURegister(0xff45, memory)
    this.windowYRegister = new GPURegister(0xff4a, memory)
    this.backgroundPaletteRegister = new BackgroundPaletteRegister(0xff47, memory)
    this.objectPaletteRegister0 = new ObjectPaletteRegister(0xff48, memory)
    this.objectPaletteRegister1 = new ObjectPaletteRegister(0xff49, memory)
  }
}

