import { Memory } from "../Memory"
import { MemoryRegister } from "./MemoryRegister"


export class InterruptEnableRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xffff, memory, "InterruptEnableRegister")
  }
  isVBlankInterruptEnabled() {
    return this.getBit(0)
  }

  isLCDStatInterruptEnabled() {
    return this.getBit(1)
  }

  isTimerInterruptEnabled() {
    return this.getBit(2)
  }

  isSerialInterruptEnabled() {
    return this.getBit(3)
  }

  isJoypadInterruptEnabled() {
    return this.getBit(4)
  }
}