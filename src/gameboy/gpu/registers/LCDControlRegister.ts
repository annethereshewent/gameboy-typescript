import { Memory } from "../../cpu/Memory"
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class LCDControlRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff40, memory, "LCDControlRegister")
  }
  // GB mode only
  isBackgroundOn() {
    return this.getBit(0) === 1
  }

  // GBC mode only
  doesBgHavePriority() {
    return this.getBit(0) === 1
  }

  isObjOn() {
    return this.getBit(1) === 1
  }

  objSize() {
    return this.getBit(2) === 0 ? 8 : 16
  }

  bgTileMapArea(): number {
    return this.getBit(3) === 0 ? 0x9800 : 0x9c00
  }

  bgAndWindowTileDataArea() {
    return this.getBit(4) === 0 ? 0x8800 : 0x8000
  }

  isWindowOn() {
    return this.getBit(5) === 1
  }

  windowTileMapArea() {
    return this.getBit(6) === 0 ? 0x9800 : 0x9c00
  }

  isLCDControllerOn() {
    return this.getBit(7) === 1
  }
}