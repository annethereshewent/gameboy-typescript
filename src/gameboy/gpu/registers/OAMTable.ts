import { Memory } from "../../cpu/Memory"
import { getBit } from "../../misc/BitOperations"

// see https://gbdev.io/pandocs/OAM.html
const OAM_START = 0xfe00
const OAM_END = 0xfe9f

export class OAMTable {
  memory: Memory
  entries: OAMEntry[] = []
  constructor(memory: Memory) {
    this.memory = memory
    for (let i = OAM_START; i < OAM_END; i += 4) {
      this.entries.push(new OAMEntry(i, memory))
    }
  }
}

export class OAMEntry {
  address: number
  memory: Memory
  constructor(address: number, memory: Memory) {
    this.address = address
    this.memory = memory
  }

  get yPosition() {
    return this.memory.readByte(this.address)
  }

  get xPosition() {
    return this.memory.readByte(this.address + 1)
  }

  get tileIndex() {
    return this.memory.readByte(this.address + 2)
  }

  get attributeFlags() {
    return this.memory.readByte(this.address + 3)
  }

  get isXFlipped() {
    return getBit(this.attributeFlags, 5)
  }

  get isYFlipped() {
    return getBit(this.attributeFlags, 6)
  }

  get bgAndWindowOverObj() {
    return getBit(this.attributeFlags, 7)
  }
}
