import { getBit, setBit } from "../misc/BitOperations"
import { Cartridge } from "./Cartridge"
import { CartridgeType } from "./CartridgeType"
import { ReadMethod } from "./ReadMethod"
import { WriteMethod } from "./WriteMethods"

export class Mbc3Cartridge extends Cartridge {


  constructor(gameDataView: DataView) {
    super(gameDataView)

    console.log(this.ramSize.toString(16))
    // set an interval to update the clock every second
    setInterval(() => {

      if (!this.clockIsLatched) {
        const date = new Date()

        this.secondsRegister = date.getSeconds()
        this.minutesRegister = date.getMinutes()
        this.hoursRegister = date.getHours()

        this.lowerDaysRegister = this.getDays()
      }
    }, 1000)
  }

  ramBuffer = new ArrayBuffer(this.ramSize)
  ramView = new DataView(this.ramBuffer)
  ramBytes = new Uint8Array(this.ramBuffer)

  mode = 0
  ramAndTimerEnable = false
  romBankNumber = 1
  ramBankNumberOrRtcRegister = 0

  secondsRegister = 0
  minutesRegister = 0
  hoursRegister = 0

  lowerDaysRegister = 0
  upperDaysRegister = 0

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

    const maskedAddress = address & 0b1111111111111

    if (this.ramBankNumberOrRtcRegister <= 3) {
      const realAddress = (this.ramBankNumberOrRtcRegister << 13 + maskedAddress)

      console.log(`reading from address 0x${realAddress.toString(16)}`)

      return ramRead(realAddress)
    } else {
      switch (this.ramBankNumberOrRtcRegister) {
        case 0x8:
          return this.secondsRegister
        case 0x9:
          return this.minutesRegister
        case 0xa:
          return this.hoursRegister
        case 0xb:
          return this.lowerDaysRegister
        case 0xc:
          return this.upperDaysRegister
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
      }
      this.latchClockRegister = value
    } else if (this.isRamOrRtcRegisterAddress(address)) {
      const maskedAddress = address & 0b1111111111111

      if (this.ramBankNumberOrRtcRegister <= 3) {
        const realAddress = (this.ramBankNumberOrRtcRegister << 13) + maskedAddress
        sramWrite(realAddress, value)
      } else {
        this.upperDaysRegister = setBit(this.upperDaysRegister, 6, 1)
        switch (this.ramBankNumberOrRtcRegister) {
          case 0x8:
          this.secondsRegister = value % 60
          break
        case 0x9:
          this.minutesRegister = value % 60
          break
        case 0xa:
          this.hoursRegister = value % 60
          break
        case 0xb:
          const upperBit = getBit(value, 8)
          this.lowerDaysRegister = value & 0b11111111
          this.upperDaysRegister = setBit(this.upperDaysRegister, 0, upperBit)
          if (value > 0x1ff) {
            // overflow happens
            this.upperDaysRegister = setBit(this.upperDaysRegister, 7, 1)
          }
          break
        case 0xc:
          this.upperDaysRegister = value & 0xff
          break
        default:
          throw new Error("invalid value specified")
        }
        this.upperDaysRegister = setBit(this.upperDaysRegister, 6, 0)
      }
    }
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