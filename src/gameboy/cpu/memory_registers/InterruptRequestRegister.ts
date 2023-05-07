import { Memory } from "../Memory"
import { MemoryRegister } from "./MemoryRegister"

export class InterruptRequestRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff0f, memory, "InterruptRequestRegister")
  }
  vBlankInterruptRequest() {
    return this.getBit(0)
  }

  lcdStatInterruptRequest() {
    return this.getBit(1)
  }

  timerInterruptRequest() {
    return this.getBit(2)
  }

  serialInterruptRequest() {
    return this.getBit(3)
  }

  joypadInterruptRequest() {
    return this.getBit(4)
  }

  clearVBlankRequest() {
    this.resetBit(0)
  }

  clearLcdStatRequest() {
    this.resetBit(1)
  }

  clearTimerRequest() {
    this.resetBit(2)
  }

  clearSerialRequest() {
    this.resetBit(3)
  }

  clearJoypadRequest() {
    this.resetBit(4)
  }

  triggerVBlankRequest() {
    this.setBit(0, 1)
  }

  triggerLcdStatRequest() {
    this.setBit(1, 1)
  }

  triggerTimerRequest() {
    this.setBit(2, 1)
  }

  triggerSerialRequest() {
    this.setBit(3, 1)
  }

  triggerJoypadRequest() {
    this.setBit(4, 1)
  }
}