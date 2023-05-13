import { CPURegister } from "./CPURegister"

export class FlagsRegisterPair extends CPURegister {
  set value(newVal: number) {
    // clear the first four bits after setting the new value
    const clearFlags = 0b1111111111110000

    this.dataView.setUint16(this.registerId, newVal & clearFlags, true)

    // console.log(`AF = 0x${(newVal & clearFlags).toString(16)}`)
  }

  get value() {
    return this.dataView.getUint16(this.registerId, true)
  }

  get hexValue() {
    return `0x${this.value.toString(16)}`
  }
}