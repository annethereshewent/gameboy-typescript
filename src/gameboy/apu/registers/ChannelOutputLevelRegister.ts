import { Memory } from "../../cpu/Memory"
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class ChannelOutputLevelRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff1c, memory)
  }
  get outputLevelSelection() {
    return (this.value >> 5) & 0b11
  }
}