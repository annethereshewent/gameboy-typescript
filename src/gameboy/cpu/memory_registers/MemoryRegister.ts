import { getBit, resetBit, setBit } from "../../misc/BitOperations"
import { Memory } from "../Memory"

export class MemoryRegister {
  address: number
  protected memory: Memory
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
    this.memory.writeByte(this.address, newValue, this.type)
  }

  protected setBit(pos: number, bitValue: number) {
    this.value = setBit(this.value, pos, bitValue)
  }

  protected getBit(pos: number): number {
    return getBit(this.value, pos)
  }

  protected resetBit(pos: number) {
    this.value = resetBit(this.value, pos)
  }
}