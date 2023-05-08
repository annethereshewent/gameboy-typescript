import { Gameboy } from "../Gameboy"

export class Memory {
  memoryBuffer = new ArrayBuffer(0x10000)
  memoryView = new DataView(this.memoryBuffer)
  memoryBytes = new Uint8Array(this.memoryBuffer)
  gameDataView?: DataView

  loadCartridge(gameDataView: DataView) {
    this.gameDataView = gameDataView
  }

  reset() {
    this.memoryBuffer = new ArrayBuffer(0x10000)
    this.memoryView = new DataView(this.memoryBuffer)
    this.memoryBytes = new Uint8Array(this.memoryBuffer)
  }

  readByte(address: number): number {
    if (this.gameDataView == null) {
      throw new Error("game ROM not loaded into memory!")
    }
    if (this.isAccessingCartridge(address)) {
      return this.gameDataView.getUint8(address)
    }

    return this.memoryView.getUint8(address)
  }

  readSignedByte(address: number): number {
    if (this.gameDataView == null) {
      throw new Error("game ROM not loaded into memory!")
    }
    if (this.isAccessingCartridge(address)) {
      return this.gameDataView.getInt8(address)
    }
    return this.memoryView.getInt8(address)
  }

  readWord(address: number): number {
    if (this.gameDataView == null) {
      throw new Error("game ROM not loaded into memory!")
    }
    if (this.isAccessingCartridge(address)) {
      return this.gameDataView.getUint16(address, true)
    }
    return this.memoryView.getUint16(address, true)
  }

  writeByte(address: number, value: number, caller?: string) {
    this.memoryView.setUint8(address, value)
    // if (Gameboy.shouldOutputLogs() && address >= 0x8000 && address  <= 0x8fff) {
    //   const byte = this.readByte(address).toString(16)
    //   console.log(`0x${address.toString(16)}: 0x${byte}`)
    // }

    // if (address === 0xff40) {
    //   console.log(`caller is ${caller}`)
    //   console.log(`writing to LCD control register, isLCDControllerOn = ${(value >> 7) & 1}`)
    // }
  }

  writeWord(address: number, value: number) {
    this.memoryView.setUint16(address, value, true)
  }

  isAccessingCartridge(address: number): boolean {
    return address <= 0x7FFF || (address >= 0xA000 && address <= 0xBFFF)
  }
}