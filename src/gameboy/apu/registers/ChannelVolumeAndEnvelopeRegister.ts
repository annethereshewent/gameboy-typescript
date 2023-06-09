import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class ChannelVolumeAndEnvelopeRegister extends MemoryRegister {
  get sweepPace() {
    return this.value & 0b111
  }

  get envelopeDirection() {
    return this.getBit(3)
  }

  get initialVolume() {
    return this.value >> 4
  }
}