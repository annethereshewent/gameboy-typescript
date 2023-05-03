import { GPURegister } from "./GPURegister"

export class LCDControlRegister extends GPURegister {
  isBackgroundOn() {
    return this.getBit(0) === 1
  }

  isObjOn() {
    return this.getBit(1) === 1
  }

  isWindowOn() {
    return this.getBit(5) === 1
  }

  isLCDControllerOn() {
    return this.getBit(7) === 1
  }
}