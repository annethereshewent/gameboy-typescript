import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class ChannelFrequencyHighRegister extends MemoryRegister {
  get frequencyHighBits() {
    return this.value & 0b111
  }

  get soundLengthEnable() {
    return this.getBit(6)
  }

  get restartTrigger() {
    return this.getBit(7)
  }

  set restartTrigger(newValue: number) {
    this.setBit(7, newValue & 0b1)
  }
}