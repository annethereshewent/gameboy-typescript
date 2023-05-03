import { Memory } from "../../cpu/Memory"

export class GPURegister {
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
}