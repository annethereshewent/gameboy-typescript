import { Gameboy } from "../../Gameboy"
import { Memory } from "../Memory"

export class MemoryRegister {
  address: number
  private memory: Memory
  child: string

  constructor(address: number, memory: Memory, child: string) {
    this.address = address
    this.memory = memory

    this.child = child
  }

  get value(): number {
    return this.memory.readByte(this.address)
  }

  set value(newValue: number) {
    this.memory.writeByte(this.address, newValue, "MemoryRegister")
  }

  setBit(pos: number, bitValue: number) {
    this.resetBit(pos)

    if (bitValue === 1) {
      this.value |= (bitValue << pos)
    }
  }

  getBit(pos: number): number {
    return (this.value >> pos) & 1
  }

  resetBit(pos: number) {
    this.value = this.value & ~(0b1 << pos)
  }
}