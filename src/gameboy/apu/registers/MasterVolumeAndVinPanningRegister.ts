import { Memory } from "../../cpu/Memory";
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class MasterVolumeAndVinPanningRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff24, memory)
  }

  get rightVolume() {
    return (this.value & 0b111) + 1
  }

  get mixVinIntoRightOutput() {
    return this.getBit(3)
  }

  get leftVolume() {
    return ((this.value >> 4) & 0b111) + 1
  }

  get mixVinIntoLeftOutput() {
    return this.getBit(7)
  }
}