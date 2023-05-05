import { Memory } from "../Memory"

export class MemoryRegister {
  private address: number
  private memory: Memory

  constructor(address: number, memory: Memory) {
    this.address = address
    this.memory = memory
  }

  get value(): number {
    return this.memory.readByte(this.address)
  }

  set value(newValue: number) {
    this.memory.writeByte(this.address, newValue)
  }

  setBit(pos: number, bitValue: number) {
    let result = this.resetBit(pos)

    if (bitValue === 1) {
      result |= (bitValue << pos)
    }

    this.value = result
  }

  getBit(pos: number): number {
    return (this.value >> pos) & 1
  }

  resetBit(pos: number): number {
    return this.value & ~(0b1 << pos)
  }
}