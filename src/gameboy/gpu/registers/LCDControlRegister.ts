import { Memory } from "../../cpu/Memory"
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class LCDControlRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff40, memory)
  }
  isBackgroundOn() {
    return this.getBit(0) === 1
  }

  isObjOn() {
    return this.getBit(1) === 1
  }

  isWindowOn() {
    return this.getBit(5) === 1
  }

  isLCDControllerOn() {
    return this.getBit(7) === 1
  }
}