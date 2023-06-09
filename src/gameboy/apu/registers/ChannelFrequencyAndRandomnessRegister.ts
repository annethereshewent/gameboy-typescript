import { Memory } from "../../cpu/Memory"
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class ChannelFrequencyAndRandomnessRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff22, memory)
  }

  get divisorCode() {
    return this.value & 0b111
  }

  get lfsrWidth() {
    return this.getBit(3)
  }

  get clockShift() {
    return this.value >> 4
  }
}