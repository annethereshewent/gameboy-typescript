export class CPURegister {

  name: string
  private registerId: number
  private dataView: DataView
  is16Bit: boolean

  constructor(name: string, initialValue = 0, id: number, dataView: DataView, is16Bit: boolean) {
    this.name = name
    this.registerId = id

    this.dataView = dataView
    this.is16Bit = is16Bit

    this.value = initialValue
  }

  get value() {
    if (!this.is16Bit) {
      return this.dataView.getUint8(this.registerId)
    } else {
      return this.dataView.getUint16(this.registerId, true)
    }
  }

  get hexValue() {
    return `0x${this.value.toString(16)}`
  }

  set value(newValue: number) {
    if (!this.is16Bit) {
      this.dataView.setUint8(this.registerId, newValue)
    } else {
      this.dataView.setUint16(this.registerId, newValue, true)
    }
  }
}