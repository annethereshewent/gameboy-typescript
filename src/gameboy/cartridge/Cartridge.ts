
export class Cartridge {
  gameDataView: DataView
  gameBytes: Uint8Array
  constructor(gameDataView: DataView) {
    this.gameDataView = gameDataView
    this.gameBytes = new Uint8Array(gameDataView.buffer)
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
   * See below for info on headers and what they return.
   * https://gbdev.io/pandocs/The_Cartridge_Header.html
   */


  get romSize() {
    const romAddress = 0x148
    const sizeCode = this.gameDataView.getUint8(romAddress)
    const sizes = [
      0x08000,
      0x010000,
      0x020000,
      0x040000,
      0x080000,
      0x100000,
      0x200000,
      0x400000,
      0x800000,
    ]

    return sizes[sizeCode]
  }

  get name() {
    const nameStart = 0x134
    const nameEnd = 0x143

    return new TextDecoder().decode(this.gameBytes.subarray(nameStart, nameEnd))
  }

  get type(){
    const typeAddress = 0x147

    return this.gameDataView.getUint8(typeAddress)
  }

  get ramSize() {
    const ramAddress = 0x149
    const sizeCode = this.gameDataView.getUint8(ramAddress)

    const sizes = [
      0,
      -1, // unused
      0x002000,
      0x008000,
      0x032000,
      0x020000,
      0x010000,
    ]

    return sizes[sizeCode]
  }
}