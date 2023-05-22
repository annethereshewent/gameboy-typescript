import { getBit, setBit } from "../misc/BitOperations"
import { CartridgeType } from "./CartridgeType"
import { MbcCartridge } from "./MbcCartridge"
import { ReadMethod } from "./ReadMethod"
import { WriteMethod } from "./WriteMethods"

enum RtcType {
  Unlatched,
  Latched
}

export class Mbc3Cartridge extends MbcCartridge {
  constructor(gameDataView: DataView) {
    super(gameDataView)

    if (this.type === CartridgeType.MBC3_PLUS_TIMER_PLUS_RAM_PLUS_BATTERY) {
      this.updateClock()
      setInterval(() => {
        this.updateClock()
      }, 1000)
    }

    if ([CartridgeType.MBC3_PLUS_RAM_PLUS_BATTERY, CartridgeType.MBC3_PLUS_TIMER_PLUS_BATTERY, CartridgeType.MBC3_PLUS_TIMER_PLUS_RAM_PLUS_BATTERY].includes(this.type)) {
      this.hasBattery = true
    }
  }

  mode = 0
  ramAndTimerEnable = false
  romBankNumber = 1
  ramBankNumberOrRtcRegister = 0

  sramTimeout: ReturnType<typeof setTimeout>|null = null

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

  updateClock() {
    const date = new Date()

    this.secondsRegister[RtcType.Unlatched] = date.getSeconds()
    this.minutesRegister[RtcType.Unlatched] = date.getMinutes()
    this.hoursRegister[RtcType.Unlatched] = date.getHours()

    this.lowerDaysRegister[RtcType.Unlatched] = this.getDays()
    this.upperDaysRegister[RtcType.Unlatched] = 0
  }

  getDays() {
    const date = new Date()
    return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000
  }


  protected _read(address: number, readMethod: ReadMethod): number {
    const read = this.readMethods[readMethod]
    const ramRead = this.ramReadMethods[readMethod]

    if (this.isRomBankZero(address)) {
      return read(address)
    }
    if (this.isRomBankOneThru7f(address)) {

      const maskedAddress = address & 0b11111111111111

      const actualAddress = (this.romBankNumber << 14) | maskedAddress
      return read(actualAddress)
    }
    if (!this.ramAndTimerEnable) {
      return 0xff
    }
    if (this.ramBankNumberOrRtcRegister <= 3) {
      const maskedAddress = (address - 0xa000) & 0b1111111111111
      const realAddress = ((this.ramBankNumberOrRtcRegister << 13) | maskedAddress)

      return ramRead(realAddress)
    } else {
      return this.readFromRtcRegister()
    }
  }

  private copyRTCToLatchedRegisters() {
    this.secondsRegister[RtcType.Latched] = this.secondsRegister[RtcType.Unlatched]
    this.minutesRegister[RtcType.Latched] = this.minutesRegister[RtcType.Unlatched]
    this.hoursRegister[RtcType.Latched] = this.minutesRegister[RtcType.Unlatched]
    this.lowerDaysRegister[RtcType.Latched] = this.lowerDaysRegister[RtcType.Unlatched]
    this.upperDaysRegister[RtcType.Latched] = this.upperDaysRegister[RtcType.Unlatched]
  }

  protected _write(address: number, value: number, writeMethod: WriteMethod) {
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
      if (this.ramBankNumberOrRtcRegister <= 3) {
        const maskedAddress = (address - 0xa000) & 0b1111111111111
        const realAddress = (this.ramBankNumberOrRtcRegister << 13) + maskedAddress
        sramWrite(realAddress, value)
      } else {
        this.updateRtcRegister(value)
      }
    }
  }

  readFromRtcRegister() {
    const registerIndex = RtcType.Unlatched
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
        throw new Error(`invalid value specified:0x${this.ramBankNumberOrRtcRegister.toString(16)}`)
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

  private isRomBankOneThru7f(address: number) {
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