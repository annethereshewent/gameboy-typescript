import { Memory } from "../Memory"

export class MemoryRegister {
  address: number
  private memory: Memory
  type?: string

  constructor(address: number, memory: Memory, type?: string) {
    this.address = address
    this.memory = memory

    this.type = type
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