import { CartridgeType } from "./CartridgeType"
import { MbcCartridge } from "./MbcCartridge"
import { ReadMethod } from "./ReadMethod"
import { WriteMethod } from "./WriteMethods"

export class Mbc5Cartridge extends MbcCartridge {
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

  protected _read(address: number, readMethod: ReadMethod): number {
    const read = this.readMethods[readMethod]
    const ramRead = this.ramReadMethods[readMethod]

    if (this.isRomBankZero(address)) {
      return read(address)
    } if (this.isRomBankZeroThrough1ff(address)) {
      const maskedAddress = address & 0b11111111111111

      const romBankNumber = (this.romBankNumberHigher << 8) + this.romBankNumberLower

      const actualAddress = ((romBankNumber << 14) + maskedAddress) & (this.romSize - 1)

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