import { logger } from "../../logging/Logger"
import { Cartridge } from "./Cartridge"
import { CartridgeType } from "./CartridgeType"
import { ReadMethod } from "./ReadMethod"
import { WriteMethod } from "./WriteMethods"

export class Mbc3Cartridge extends Cartridge {
  ramBuffer = new ArrayBuffer(this.ramSize)
  ramView = new DataView(this.ramBuffer)
  ramBytes = new Uint8Array(this.ramBuffer)

  mode = 0
  ramAndTimerEnable = false
  romBankNumber = 1
  ramBankNumber = 0

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

  stringToSram() {
    return new TextEncoder().encode(localStorage.getItem(this.name) || "")
  }

  sramToString() {
    return new TextDecoder().decode(this.ramBytes)
  }


  readByte(address: number): number {
    return this._read(address, ReadMethod.READ_BYTE)
  }

  readWord(address: number) {
    return this._read(address, ReadMethod.READ_WORD)
  }

  private _read(address: number, readMethod: ReadMethod): number {
    const read = this.readMethods[readMethod]
    const ramRead = this.readMethods[readMethod]

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

    if (this.ramBankNumber <= 3) {
      const realAddress = this.ramBankNumber << 13 + maskedAddress

      return ramRead(realAddress)
    }
    throw new Error("not implemented")
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
      this.ramBankNumber = value
    } else if (this.isLatchClockAddress(address)) {
      // TODO
      console.log('not implemented yet!')
    } else if (this.isRamOrRtcRegisterAddress(address)) {
      const maskedAddress = address & 0b1111111111111

      if (this.ramBankNumber <= 3) {
        const realAddress = (this.ramBankNumber << 13) + maskedAddress
        sramWrite(realAddress, value)
      } else {
        // TODO
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