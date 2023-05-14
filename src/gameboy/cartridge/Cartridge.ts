
export class Cartridge {
  gameDataView: DataView
  constructor(gameDataView: DataView) {
    this.gameDataView = gameDataView
  }

  readByte(address: number) {
    return this.gameDataView.getUint8(address)
  }

  readWord(address: number) {
    return this.gameDataView.getUint16(address, true)
  }

  readSignedByte(address: number) {
    return this.gameDataView.getInt8(address)
  }

  writeByte(address: number, value: number) {
    return
  }

  writeWord(address: number, value: number) {
    return
  }
  /**
   * https://gbdev.io/pandocs/The_Cartridge_Header.html
   */
  get romSize() {
    const sizeOffset = 0x148
    const sizeCode = this.gameDataView.getUint8(sizeOffset)
    const sizes = [
      0x08000,
      0x010000,
      0x020000,
      0x040000,
      0x080000,
      0x100000,
      0x200000,
      4096,
      8192,
    ]

    return sizes[sizeCode]
  }
}