
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

  isGameboyColor(): boolean {
    const gbcFlag = this.gameDataView.getUint8(0x143)
    return [0x80, 0xc0].includes(gbcFlag)
  }

  /**
   * See below for info on headers and what they return.
   * https://gbdev.io/pandocs/The_Cartridge_Header.html
   */


  get romSize() {
    const romAddress = 0x148
    const sizeCode = this.gameDataView.getUint8(romAddress)
    const sizes = [
      0x08000, // 32 kb
      0x010000, // 64 kb
      0x020000, // 128 kb
      0x040000, // 256 kb
      0x080000, // 512 kb
      0x100000, // 1 mb
      0x200000, // 2mb
      0x400000, // 4mb
      0x800000, // 8mb
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
      0x002000, // 8 kb
      0x008000, // 32 kb
      0x020000, // 128 kb
      0x010000, // 64 kb
    ]

    return sizes[sizeCode]
  }
}