import { Memory } from "../../cpu/Memory"
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class BackgroundPaletteIndexRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff68, memory, "BackgroundPaletteIndexRegister")
  }
  get paletteAddress() {
    return this.value & 0b111111
  }

  get autoIncrement() {
    return (this.value >> 7) & 1
  }
}