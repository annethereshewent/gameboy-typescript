import { Memory } from "../../cpu/Memory"
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class BackgroundPaletteRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff47, memory)
  }
  get color0() {
    return this.value & 0b11
  }

  get color1() {
    return (this.value >> 2) & 0b11
  }

  get color2() {
    return (this.value >> 4) & 0b11
  }

  get color3() {
    return (this.value >> 6) & 0b11
  }

  get colors() {
    return [this.color0, this.color1, this.color2, this.color3]
  }
}