export class Memory {
  memoryBuffer = new ArrayBuffer(2 ^ 16)
  memoryView = new DataView(this.memoryBuffer)
  memoryBytes = new Uint8Array(this.memoryBuffer)
  gameDataView?: DataView

  loadCartridge(gameDataView: DataView) {
    this.gameDataView = gameDataView
  }

  readByte(address: number): number|undefined {
    return this.gameDataView?.getUint8(address)
  }
}