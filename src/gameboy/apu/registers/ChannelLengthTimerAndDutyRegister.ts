import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class ChannelLengthTimerAndDutyRegister extends MemoryRegister {
  get waveDuty() {
    return (this.value >> 6) & 0b11
  }

  get initialLengthTimer() {
    return this.value & 0b111111
  }
}