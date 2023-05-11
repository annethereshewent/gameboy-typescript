import { getBit, setBit } from "../../misc/BitOperations"

export class JoypadRegister {
  value = 0xff

  isPressingDown = false
  isPressingUp = false
  isPressingLeft = false
  isPressingRight = false
  isPressingA = false
  isPressingB = false
  isPressingStart = false
  isPressingSelect = false

  getInput() {
    if (this.isCheckingDirections) {
      this.setBit(0, this.isPressingRight ? 0 : 1)
      this.setBit(1, this.isPressingLeft ? 0 : 1)
      this.setBit(2, this.isPressingUp ? 0 : 1)
      this.setBit(3, this.isPressingDown ? 0 : 1)
    }
    if (this.isCheckingButtons) {
      this.setBit(0, this.isPressingA ? 0 : 1)
      this.setBit(1, this.isPressingB ? 0 : 1)
      this.setBit(2, this.isPressingSelect ? 0 : 1)
      this.setBit(3, this.isPressingStart ? 0 : 1)
    }

    return this.value
  }

  get isCheckingDirections() {
    return !this.getBit(4)
  }

  get isCheckingButtons() {
    return !this.getBit(5)
  }

  private setBit(pos: number, bitValue: number) {
    this.value = setBit(this.value, pos, bitValue)
  }

  private getBit(pos: number) {
    return getBit(this.value, pos)
  }
}

export const joypadRegister = new JoypadRegister()