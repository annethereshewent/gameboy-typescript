import { Memory } from "../../cpu/Memory"
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class SoundOnRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff26, memory)
  }

  get isSoundOn() {
    return this.getBit(7)
  }

  get isChannel1On() {
    return this.getBit(0)
  }

  get isChannel2On() {
    return this.getBit(1)
  }

  get isChannel3On() {
    return this.getBit(2)
  }

  get isChannel4On() {
    return this.getBit(3)
  }

  set isChannel4On(newValue: number) {
    this.setBit(3, newValue & 0b1)
  }

  set isChannel3On(newValue: number) {
    this.setBit(2, newValue & 0b1)
  }

  set isChannel2On(newValue: number) {
    this.setBit(1, newValue & 0b1)
  }

  set isChannel1On(newValue: number) {
    this.setBit(0, newValue & 0b1)
  }
}