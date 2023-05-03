import { GPURegister } from "../GPURegister"
import { LCDStatusMode } from "./LCDStatusMode"

export class LCDStatusRegister extends GPURegister {
  get mode() {
    return this.value & 0b11
  }

  set mode(newMode: LCDStatusMode) {
    this.value = newMode
  }
}