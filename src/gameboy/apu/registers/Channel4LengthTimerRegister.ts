import { Memory } from "../../cpu/Memory"
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class Channel4LengthTimerRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff20, memory)
  }
  get lengthTimer() {
    return this.value & 0b111111
  }
}