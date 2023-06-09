import { Memory } from "../../cpu/Memory";
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class ChannelSweepRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff10, memory)
  }

  get sweepShift() {
    return this.value & 0b111
  }

  get sweepDirection() {
    return this.getBit(3)
  }

  get sweepPace() {
    return (this.value >> 4) & 0b111
  }
}