import { SramSaver } from "../misc/SramSaver"
import { Cartridge } from "./Cartridge"
import { CartridgeType } from "./CartridgeType"
import { ReadMethod } from "./ReadMethod"
import { WriteMethod } from "./WriteMethods"

export class Mbc5Cartridge extends Cartridge {
  romBankNumberLower = 0
  romBankNumberHigher = 0
  ramBankNumber = 0
  ramEnabled = false

  constructor(gameDataView: DataView) {
    super(gameDataView)

    if (this.type === CartridgeType.MBC5_PLUS_RAM_PLUS_BATTERY) {
      this.hasBattery = true
    }
  }

  hasBattery = false

  ramBuffer = new ArrayBuffer(this.ramSize)
  ramView = new DataView(this.ramBuffer)
  ramBytes = new Uint8Array(this.ramBuffer)

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
      if (this.hasBattery) {
        SramSaver.saveFile(this.name, this.ramBytes)
      }
    },
    (address: number, value: number) => {
      this.ramView.setUint16(address, value, true)
      if (this.hasBattery) {
        SramSaver.saveFile(this.name, this.ramBytes)
      }
    }
  ]

  protected _read(address: number, readMethod: ReadMethod): number {
    const read = this.readMethods[readMethod]
    const ramRead = this.ramReadMethods[readMethod]

    if (this.isRomBankZero(address)) {
      return read(address)
    } if (this.isRomBankZeroThrough1ff(address)) {
      const maskedAddress = address & 0b11111111111111

      const romBankNumber = (this.romBankNumberHigher << 8) + this.romBankNumberLower

      const actualAddress = (romBankNumber << 14) + maskedAddress


      return read(actualAddress)
    }
    if (this.isRam(address)) {
      if (!this.ramEnabled) {
        return 0xff
      }

      const maskedAddress = (address - 0xa000) & 0b1111111111111
      const realAddress = ((this.ramBankNumber << 13) + maskedAddress)

      return ramRead(realAddress)
    }

    throw Error("invalid address specified")
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

  writeByte(address: number, value: number) {
    this._write(address, value, WriteMethod.WRITE_BYTE)
  }

  writeWord(address: number, value: number) {
    this._write(address, value, WriteMethod.WRITE_WORD)
  }

  protected _write(address: number, value: number, writeMethod: WriteMethod) {
    const ramWrite = this.ramWriteMethods[writeMethod]

    if (this.isRamEnable(address)) {
      const lowerBits = value & 0b1111
      this.ramEnabled = lowerBits === 0xa
    } else if (this.isRomBankNumberLowerBits(address)) {
      this.romBankNumberLower = value & 0b11111111
    } else if (this.isRomBankNumberUpperBit(address)) {
      this.romBankNumberHigher = value & 0b1
    } else if (this.isRamBankNumber(address)) {
      this.ramBankNumber = value & 0xf
    } else if (this.isRam(address) && this.ramEnabled) {
      const maskedAddress = (address - 0xa000) & 0b1111111111111
      const realAddress = (this.ramBankNumber << 13) + maskedAddress
      ramWrite(realAddress, value)
    }
  }

  // memory addresses
  private isRomBankZero(address: number) {
    return address >= 0 && address <= 0x3fff
  }

  private isRomBankZeroThrough1ff(address: number) {
    return address >= 0x4000 && address <= 0x7fff
  }

  private isRam(address: number) {
    return address >= 0xa000 && address <= 0xbfff
  }

  // registers (write only)
  private isRamEnable(address: number) {
    return address >= 0 && address <= 0x1fff
  }

  private isRomBankNumberLowerBits(address: number) {
    return address >= 0x2000 && address <= 0x2fff
  }
  private isRomBankNumberUpperBit(address: number) {
    return address >= 0x3000 && address <= 0x3fff
  }

  private isRamBankNumber(address: number) {
    return address >= 0x4000 && address <= 0x5fff
  }
}