import { Memory } from "../Memory";
import { MemoryRegister } from "./MemoryRegister"

export class JoypadRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff00, memory, "JoypadRegister")

    this.value = 0xff
  }

  set isPressingUp(val: boolean) {
    if (val) {
      this.resetBit(2)
    } else {
      this.setBit(2, 1)
    }
  }

  set isPressingDown(val: boolean) {
    if (val) {
      this.resetBit(3)
    } else {
      this.setBit(3, 1)

    }
  }

  set isPressingLeft(val: boolean) {
    if (val) {
      this.resetBit(1)
    } else {
      this.setBit(1, 1)
    }
  }

  set isPressingRight(val: boolean) {
    if (val) {
      this.resetBit(0)

    } else {
      this.setBit(0, 1)
    }
  }

  set isPressingStart(val: boolean) {
    if (val) {
      this.resetBit(3)
    } else {
      this.setBit(3, 1)
    }
  }

  set isPressingSelect(val: boolean) {
    if (val) {
      this.resetBit(4)
    } else {
      this.setBit(4, 1)
    }
  }

  set isPressingA(val: boolean) {
    if (val) {
      this.resetBit(0)

    } else {
      this.setBit(0, 1)
    }
  }

  set isPressingB(val: boolean) {
    if (val) {
      this.resetBit(1)
    } else {
      this.setBit(1, 1)
    }
  }

  get isPollingDirections() {
    return !this.getBit(4)
  }

  get isPollingActions() {
    return !this.getBit(5)
  }
}