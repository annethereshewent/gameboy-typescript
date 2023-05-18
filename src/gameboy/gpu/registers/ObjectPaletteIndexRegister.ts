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
    const paletteAddress = newVal & 0b111111
    const actualWrite = (this.getBit(7) << 7) | paletteAddress

    this.memory.writeByte(this.address, actualWrite)
  }

  get autoIncrement() {
    return (this.value >> 7) & 1
  }
}