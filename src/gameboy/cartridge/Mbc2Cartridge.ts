import { CartridgeType } from "./CartridgeType";
import { Mbc1Cartridge } from "./Mbc1Cartridge";
import { ReadMethod } from "./ReadMethod";
import { WriteMethod } from "./WriteMethods";

export class Mbc2Cartridge extends Mbc1Cartridge {

  romBankNumber = 1

  constructor(gameDataView: DataView) {
    super(gameDataView)

    if (this.type === CartridgeType.MBC2_PLUS_BATTERY) {
      this.hasBattery = true
    }
  }

  protected _read(address: number, readMethod: ReadMethod) {
    const read = this.readMethods[readMethod]
    if (this.isRomBankZero(address)) {
      return read(address)
    }
    if (this.isRomBankOneThroughF(address)) {
      const maskedAddress = address & 0b11111111111111

      const actualAddress = ((this.romBankNumber << 14) + maskedAddress) & (this.romSize - 1)

      return read(actualAddress)
    }
    if (this.isRam1(address)) {
      return read(address - 0xa000) & 0b1111
    }

    const maskedAddress = (address - 0xa000) & 0b111111111

    return read(maskedAddress) & 0b1111
  }

  protected _write(address: number, value: number, writeMethod: WriteMethod) {
    const ramWrite = this.ramWriteMethods[writeMethod]

    if (this.isRamEnableOrRomBankNumber(address)) {
      const isRamEnable = (address >> 8) & 0b1

      if (isRamEnable) {
        this.ramEnabled = value === 0xa
      } else {
        this.romBankNumber = value === 0 ? 1 : value & 0b1111
      }
    } else if (this.isRam1(address)) {
      ramWrite(address - 0xa000, value)
    } else {
      const maskedAddress = (address - 0xa000) & 0b111111111

      ramWrite(maskedAddress, value & 0b1111)
    }
  }

  // read
  private isRomBankZero(address: number) {
    return address >= 0 && address <= 0x3fff
  }

  private isRomBankOneThroughF(address: number) {
    return address >= 0x4000 && address <= 0x7fff
  }

  private isRam1(address: number) {
    return address >= 0xa000 && address <= 0xa1ff
  }

  private isRam2(address: number) {
    return address >= 0xa200 && address <= 0xbfff
  }

  // registers
  private isRamEnableOrRomBankNumber(address: number) {
    return address >= 0 && address <= 0x3fff
  }
}