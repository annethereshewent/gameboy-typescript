import { GPURegister } from "../GPURegister"
import { LCDMode } from "./LCDMode"

export class LCDStatusRegister extends GPURegister {
  get mode() {
    return this.value & 0b11
  }

  set mode(newMode: LCDMode) {
    const bit0 = newMode & 1
    const bit1 = (newMode >> 1) & 1

    this.setBit(0, bit0)
    this.setBit(1, bit1)
  }
}