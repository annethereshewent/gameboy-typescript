import { getBit, setBit } from "../misc/BitOperations"
import { Cartridge } from "./Cartridge"
import { CartridgeType } from "./CartridgeType"
import { ReadMethod } from "./ReadMethod"
import { WriteMethod } from "./WriteMethods"

enum RtcType {
  Unlatched,
  Latched
}

export class Mbc3Cartridge extends Cartridge {


  constructor(gameDataView: DataView) {
    super(gameDataView)
    // set an interval to update the clock every second
    setInterval(() => {
      const date = new Date()

      this.secondsRegister[RtcType.Unlatched] = date.getSeconds()
      this.minutesRegister[RtcType.Unlatched] = date.getMinutes()
      this.hoursRegister[RtcType.Unlatched] = date.getHours()

      this.lowerDaysRegister[RtcType.Unlatched] = this.getDays()
    }, 1000)
  }

  ramBuffer = new ArrayBuffer(this.ramSize)
  ramView = new DataView(this.ramBuffer)
  ramBytes = new Uint8Array(this.ramBuffer)

  mode = 0
  ramAndTimerEnable = false
  romBankNumber = 1
  ramBankNumberOrRtcRegister = 0

  // in the case of the RTC registers, the 0th index are the
  // normal unlatched values that will continuously count down
  // the 1st index denotes latched registers
  secondsRegister = [0, 0]
  minutesRegister = [0, 0]
  hoursRegister = [0, 0]

  lowerDaysRegister = [0, 0]
  upperDaysRegister = [0, 0]

  latchClockRegister = -1

  clockIsLatched = false


  readMethods = [
    (address: number) => this.gameDataView.getUint8(address),
    (address: number) => this.gameDataView.getInt8(address),
    (address: number) => this.gameDataView.getUint16(address, true)
  ]

  ramReadMethods = [
    (address: number) => this.ramView.getUint8(address),
    (address: number) => this.ramView.getInt8(address),
    (address: number) => this.ramView.getUint16(address, true)
  ]

  ramWriteMethods = [
    (address: number, value: number) => {
      this.ramView.setUint8(address, value)
      if ([CartridgeType.MBC3_PLUS_RAM_PLUS_BATTERY, CartridgeType.MBC3_PLUS_TIMER_PLUS_BATTERY].includes(this.type)) {
        localStorage.setItem(this.name, this.sramToString())
      }
    },
    (address: number, value: number) => {
      this.ramView.setUint16(address, value, true)
      if ([CartridgeType.MBC3_PLUS_RAM_PLUS_BATTERY, CartridgeType.MBC3_PLUS_TIMER_PLUS_BATTERY].includes(this.type)) {
        localStorage.setItem(this.name, this.sramToString())
      }
    }
  ]

  getDays() {
    const date = new Date()
    return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000
  }

  stringToSram() {
    return new TextEncoder().encode(localStorage.getItem(this.name) || "")
  }

  sramToString() {
    return new TextDecoder().decode(this.ramBytes)
  }


  readByte(address: number): number {
    return this._read(address, ReadMethod.READ_BYTE)
  }

  readSignedByte(address: number): number {
    return this._read(address, ReadMethod.READ_SIGNED_BYTE)
  }

  readWord(address: number) {
    return this._read(address, ReadMethod.READ_WORD)
  }

  private _read(address: number, readMethod: ReadMethod): number {
    const read = this.readMethods[readMethod]
    const ramRead = this.ramReadMethods[readMethod]

    if (this.isRomBankZero(address)) {
      return read(address)
    }
    if (this.isRomBankOneThruSeven(address)) {

      const maskedAddress = address & 0b11111111111111

      const actualAddress = (this.romBankNumber << 14) + maskedAddress
      return read(actualAddress)
    }
    if (!this.ramAndTimerEnable) {
      return 0xff
    }
    if (this.ramBankNumberOrRtcRegister <= 3) {
      const maskedAddress = address & 0b1111111111111
      const realAddress = ((this.ramBankNumberOrRtcRegister << 13) + maskedAddress)

      return ramRead(realAddress)
    } else {
      const registerIndex = this.clockIsLatched ? RtcType.Latched : RtcType.Unlatched
      switch (this.ramBankNumberOrRtcRegister) {
        case 0x8:
          return this.secondsRegister[registerIndex]
        case 0x9:
          return this.minutesRegister[registerIndex]
        case 0xa:
          return this.hoursRegister[registerIndex]
        case 0xb:
          return this.lowerDaysRegister[registerIndex]
        case 0xc:
          return this.upperDaysRegister[registerIndex]
        default:
          throw new Error("invalid value specified")
      }
    }
  }

  writeByte(address: number, value: number) {
    this._write(address, value, WriteMethod.WRITE_BYTE)
  }

  writeWord(address: number, value: number) {
    this._write(address, value, WriteMethod.WRITE_WORD)
  }

  private copyRTCToLatchedRegisters() {
    this.secondsRegister[RtcType.Latched] = this.secondsRegister[RtcType.Unlatched]
    this.minutesRegister[RtcType.Latched] = this.minutesRegister[RtcType.Unlatched]
    this.hoursRegister[RtcType.Latched] = this.minutesRegister[RtcType.Unlatched]
    this.lowerDaysRegister[RtcType.Latched] = this.lowerDaysRegister[RtcType.Unlatched]
    this.upperDaysRegister[RtcType.Latched] = this.upperDaysRegister[RtcType.Unlatched]
  }

  private _write(address: number, value: number, writeMethod: WriteMethod) {
    const sramWrite = this.ramWriteMethods[writeMethod]
    if (this.isRamAndTimerEnableAddress(address)) {
      const lowerBits = value & 0b1111

      this.ramAndTimerEnable = lowerBits === 0xa
    } else if (this.isRomBankNumber(address)) {
      this.romBankNumber = value & 0b1111111
      if (this.romBankNumber === 0) {
        this.romBankNumber = 1
      }
    }  else if (this.isRamBankNumberOrRtcRegisterSelect(address)) {
      this.ramBankNumberOrRtcRegister = value
    } else if (this.isLatchClockAddress(address)) {
      if (this.latchClockRegister === 0 && value === 1) {
        this.clockIsLatched = !this.clockIsLatched
        if (this.clockIsLatched) {
          this.copyRTCToLatchedRegisters()
        }
      }
      this.latchClockRegister = value
    } else if (this.isRamOrRtcRegisterAddress(address)) {
      const maskedAddress = address & 0b1111111111111

      if (this.ramBankNumberOrRtcRegister <= 3) {
        const realAddress = (this.ramBankNumberOrRtcRegister << 13) + maskedAddress
        sramWrite(realAddress, value)
      } else {
        if (!this.clockIsLatched) {
          this.updateRtcRegister(value)
        }
      }
    }
  }

  private updateRtcRegister(value: number) {
    const index = RtcType.Unlatched
    this.upperDaysRegister[index] = setBit(this.upperDaysRegister[index], 6, 1)
    switch (this.ramBankNumberOrRtcRegister) {
      case 0x8:
      this.secondsRegister[index] = value % 60
      break
    case 0x9:
      this.minutesRegister[index] = value % 60
      break
    case 0xa:
      this.hoursRegister[index] = value % 60
      break
    case 0xb:
      const upperBit = getBit(value, 8)
      this.lowerDaysRegister[index] = value & 0b11111111
      this.upperDaysRegister[index] = setBit(this.upperDaysRegister[index], 0, upperBit)
      if (value > 0x1ff) {
        // overflow happens
        this.upperDaysRegister[index] = setBit(this.upperDaysRegister[index], 7, 1)
      }
    break
    case 0xc:
      this.upperDaysRegister[index] = value & 0xff
      break
    default:
      throw new Error("invalid value specified")
    }
    this.upperDaysRegister[index] = setBit(this.upperDaysRegister[index], 6, 0)
  }

  // read addresses
  private isRomBankZero(address: number) {
    return address >= 0 && address <= 0x3fff
  }

  private isRomBankOneThruSeven(address: number) {
    return address >= 0x4000 && address <= 0x7fff
  }

  // write addresses
  private isRamAndTimerEnableAddress(address: number) {
    return address >= 0 && address <= 0x1fff
  }

  private isRomBankNumber(address: number) {
    return address >= 0x2000 && address <= 0x3fff
  }

  private isRamBankNumberOrRtcRegisterSelect(address: number) {
    return address >= 0x4000 && address <= 0x5fff
  }

  private isLatchClockAddress(address: number) {
    return address >= 0x6000 && address <= 0x7fff
  }

  private isRamOrRtcRegisterAddress(address: number) {
    return address >= 0xa000 && address <= 0xbfff
  }

}