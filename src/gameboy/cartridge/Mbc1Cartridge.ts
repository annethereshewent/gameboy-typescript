import { Cartridge } from "./Cartridge"
import { CartridgeType } from "./CartridgeType"

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

  constructor(gameDataView: DataView) {
    super(gameDataView)

    if (this.type === CartridgeType.MBC1_PLUS_RAM_PLUS_BATTERY) {
      const ramBytes: Uint8Array = this.stringToSram()

      if (ramBytes.length === this.ramSize) {
        this.ramBytes = ramBytes
        this.ramView = new DataView(ramBytes.buffer)
      }
    }
  }

  ramBuffer = new ArrayBuffer(this.ramSize)
  ramView = new DataView(this.ramBuffer)
  ramBytes = new Uint8Array(this.ramBuffer)

  ramEnabled = false
  mode = 0
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
      if (this.type === CartridgeType.MBC1_PLUS_RAM_PLUS_BATTERY) {
        localStorage.setItem(this.name, this.sramToString())
      }
    },
    (address: number, value: number) => {
      this.ramView.setUint16(address, value, true)
      if (this.type === CartridgeType.MBC1_PLUS_RAM_PLUS_BATTERY) {
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

  resetRam() {
    this.ramBytes.fill(0, 0, this.ramBytes.length - 1)
  }

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
    let maskedAddress = address & 0b11111111111111
    if (address >= 0 && address <= 0x3fff) {
      return this.readFromBankZero(maskedAddress, readMethod)
    }
    if (address >= 0x4000 && address <= 0x7fff) {
      return this.readFromBanksOneThroughSeven(maskedAddress, readMethod)
    }

    return this.readFromRam(address, readMethod)
  }

  private readFromRam(address: number, readMethod: ReadMethod) {
    if (!this.ramEnabled) {
      return 0xff
    }

    const maskedAddress = address & 0b1111111111111

    const ramRead = this.ramReadMethods[readMethod]

    if (this.mode === 0) {
      return ramRead(maskedAddress)
    }

    const actualAddress = (this.ramBankNumber << 13) + maskedAddress

    return ramRead(actualAddress)
  }

  private readFromBankZero(address: number, readMethod: ReadMethod): number {
    const read = this.readMethods[readMethod]

    const maskedAddress = address & 0b11111111111111

    if (this.mode === 0) {
      return read(maskedAddress)
    }

    const actualAddress = ((this.ramBankNumber << 19) + maskedAddress)

    return read(actualAddress)
  }

  private readFromBanksOneThroughSeven(address: number, readMethod: ReadMethod): number {
    const read = this.readMethods[readMethod]

    const bankNumber = (this.ramBankNumber << 5) + this.romBankNumber

    const maskedAddress = address & 0b11111111111111

    const actualAddress = ((bankNumber << 14) + maskedAddress)

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
    } else if (this.isRamAddress(address) && this.ramEnabled) {
      const maskedAddress = address & 0b1111111111111
      const ramWrite = this.ramWriteMethods[writeMethod]
      if (this.mode === 0) {
        ramWrite(maskedAddress, value)
      } else {
        const actualAddress = (this.ramBankNumber << 13) + maskedAddress
        ramWrite(actualAddress, value)
      }
    }
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

  private isRamAddress(address: number) {
    return address >= 0xa000 && address <= 0xbfff
  }
}