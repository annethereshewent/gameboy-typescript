import { Memory } from "../../cpu/Memory";
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class SoundPanningRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff25, memory)
  }

  get mixChannel1Right() {
    return this.getBit(0)
  }

  get mixChannel2Right() {
    return this.getBit(1)
  }

  get mixChannel3Right() {
    return this.getBit(2)
  }

  get mixChannel4Right() {
    return this.getBit(3)
  }

  get mixChannel1Left() {
    return this.getBit(4)
  }

  get mixChannel2Left() {
    return this.getBit(5)
  }

  get mixChannel3Left() {
    return this.getBit(6)
  }

  get mixChannel4Left() {
    return this.getBit(7)
  }
}