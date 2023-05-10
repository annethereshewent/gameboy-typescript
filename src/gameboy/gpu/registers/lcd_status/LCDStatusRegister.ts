import { Memory } from "../../../cpu/Memory"
import { MemoryRegister } from "../../../cpu/memory_registers/MemoryRegister"
import { LCDMode } from "./LCDMode"

export class LCDStatusRegister extends MemoryRegister {

  constructor(memory: Memory) {
    super(0xff41, memory, "LCDStatusRegister")

    this.value = 0x83
  }
  get mode() {
    return this.value & 0b11
  }

  set mode(newMode: LCDMode) {
    const bit0 = newMode & 1
    const bit1 = (newMode >> 1) & 1

    this.setBit(0, bit0)
    this.setBit(1, bit1)
  }

  isLineYCompareMatching() {
    return this.getBit(2)
  }

  isHBlankInterruptSelected() {
    return this.getBit(3)
  }

  isVBlankInterruptSelected() {
    return this.getBit(4)
  }

  isOamInterruptSelected() {
    return this.getBit(5)
  }

  isLineYMatchingInerruptSelected() {
    return this.getBit(6)
  }

  set lineYCompareMatching(newValue: number) {
    this.setBit(2, newValue)
  }

}