import { Memory } from "../../cpu/Memory"
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class ChannelDACEnableRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff1a, memory)
  }

  get dacEnabled() {
    return this.getBit(7)
  }
}