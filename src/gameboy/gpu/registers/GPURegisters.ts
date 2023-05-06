import { Memory } from "../../cpu/Memory"
import { BackgroundPaletteRegister } from "./BackgroundPaletteRegister"
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"
import { LCDControlRegister } from "./LCDControlRegister"
import { ObjectPaletteRegister } from "./ObjectPaletteRegister"
import { LCDStatusRegister } from "./lcd_status/LCDStatusRegister"

export class GPURegisters {
  memory: Memory

  lcdStatusRegister: LCDStatusRegister
  lineYRegister: MemoryRegister
  lcdControlRegister: LCDControlRegister
  scrollYRegister: MemoryRegister
  scrollXRegister: MemoryRegister
  lineYCompareRegister: MemoryRegister
  windowYRegister: MemoryRegister
  windowXRegister: MemoryRegister
  backgroundPaletteRegister: BackgroundPaletteRegister
  objectPaletteRegister0: ObjectPaletteRegister
  objectPaletteRegister1: ObjectPaletteRegister

  constructor(memory: Memory) {
    this.memory = memory

    this.lcdStatusRegister = new LCDStatusRegister(memory)
    this.lineYRegister = new MemoryRegister(0xff44, memory)
    this.lcdControlRegister = new LCDControlRegister(memory)
    this.scrollYRegister = new MemoryRegister(0xff42, memory)
    this.scrollXRegister = new MemoryRegister(0xff43, memory)
    this.lineYCompareRegister = new MemoryRegister(0xff45, memory)
    this.windowYRegister = new MemoryRegister(0xff4a, memory)
    this.windowXRegister = new MemoryRegister(0xff4b, memory)
    this.backgroundPaletteRegister = new BackgroundPaletteRegister(memory)
    this.objectPaletteRegister0 = new ObjectPaletteRegister(0xff48, memory)
    this.objectPaletteRegister1 = new ObjectPaletteRegister(0xff49, memory)

    // default value according to docs
    this.lcdControlRegister.value = 0x83
  }
}

