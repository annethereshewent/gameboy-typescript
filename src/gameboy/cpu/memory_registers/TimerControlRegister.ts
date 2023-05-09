import { Memory } from "../Memory";
import { MemoryRegister } from "./MemoryRegister"

export class TimerControlRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff07, memory)
  }

  isTimerEnabled() {
    return this.getBit(2)
  }

  getClockFrequency() {
    const mode = this.value & 0b11 // check the first two bits

    let clockMode = 0
    switch (mode) {
      case 0:
        clockMode = 1024
        break
      case 1:
        clockMode = 16
        break
      case 2:
        clockMode = 64
        break
      case 3:
        clockMode = 256
        break
    }

    return clockMode
  }
}