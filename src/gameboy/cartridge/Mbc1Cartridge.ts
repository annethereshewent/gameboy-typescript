import { Cartridge } from "./Cartridge"

enum ReadMethod {
  READ_BYTE,
  READ_SIGNED_BYTE,
  READ_WORD
}

enum WriteMethod {
  WRITE_BYTE,
  WRITE_WORD
}

// see https://gbdev.io/pandocs/MBC1.html for most of the details on these
export class Mbc1Cartridge extends Cartridge {

  ramEnabled = false
  mode = 0
  romBankNumber = 1
  ramBankNumber = 0

  readMethods = [
    (address: number) => this.gameDataView.getUint8(address),
    (address: number) => this.gameDataView.getInt8(address),
    (address: number) => this.gameDataView.getUint16(address, true)
  ]

  override readByte(address: number): number {
    return this._read(address, ReadMethod.READ_BYTE)
  }

  override readWord(address: number): number {
    return this._read(address, ReadMethod.READ_WORD)
  }

  override readSignedByte(address: number): number {
    return this._read(address, ReadMethod.READ_SIGNED_BYTE)
  }

  private _read(address: number, readMethod: ReadMethod): number {
    const maskedAddress = address & 0b11111111111111
    if (address >= 0 && address <= 0x3fff) {
      return this.readFromBankZero(maskedAddress, readMethod)
    }
    if (address >= 0x4000 && address <= 0x7fff) {
      return this.readFromBanksOneThroughSeven(maskedAddress, readMethod)
    }
    if (!this.ramEnabled) {
      return 0xff
    }

    throw new Error("RAM not implemented yet")
  }

  private readFromBankZero(address: number, readMethod: ReadMethod): number {
    const read = this.readMethods[readMethod]

    if (this.mode === 0) {
      return read(address)
    }

    const actualAddress = ((this.ramBankNumber << 19) + address) & (this.romSize - 1)

    return read(actualAddress)
  }

  private readFromBanksOneThroughSeven(address: number, readMethod: ReadMethod): number {
    const read = this.readMethods[readMethod]

    const bankNumber = (this.ramBankNumber << 5) + this.romBankNumber

    const actualAddress = ((bankNumber << 14) + address) & (this.romSize - 1)

    return read(actualAddress)
  }

  writeByte(address: number, value: number) {
    this._write(address, value, WriteMethod.WRITE_BYTE)
  }

  writeWord(address: number, value: number) {
    this._write(address, value, WriteMethod.WRITE_WORD)
  }

  private _write(address: number, value: number, writeMethod: WriteMethod) {
    if (this.isRamEnableRegister(address)) {
      this.ramEnabled = value === 0xa ? true : false
    } else if (this.isRomBankNumberRegister(address)) {
      this.romBankNumber = value === 0 ? 1 : value & 0b11111
    } else if (this.isRamBankNumberRegister(address)) {
      this.ramBankNumber = value & 0b11
    } else if (this.isBankingModeRegister(address)) {
      this.mode = value & 0b1
    }

    throw new Error("sram not implemented yet")
  }

  private isRamEnableRegister(address: number) {
    return address >= 0 && address <= 0x1fff
  }

  private isRomBankNumberRegister(address: number) {
    return address >= 0x2000 && address <= 0x3fff
  }

  private isRamBankNumberRegister(address: number) {
    return address >= 0x4000 && address <= 0x5fff
  }

  private isBankingModeRegister(address: number) {
    return address >= 0x6000 && address <= 0x7fff
  }
}