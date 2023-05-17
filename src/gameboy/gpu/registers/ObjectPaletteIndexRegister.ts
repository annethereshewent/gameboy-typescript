import { Memory } from "../../cpu/Memory";
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class ObjectPaletteIndexRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff6a, memory)
  }
  get paletteAddress() {
    return this.value & 0b111111
  }

  set paletteAddress(newVal: number) {
    this.memory.writeByte(this.address, newVal)
  }

  get autoIncrement() {
    return (this.value >> 7) & 1
  }
}