import { SramSaver } from "../misc/SramSaver"
import { Cartridge } from "./Cartridge"
import { ReadMethod } from "./ReadMethod"
import { WriteMethod } from "./WriteMethods"

export class MbcCartridge extends Cartridge {

  constructor(gameDataView: DataView) {
    super(gameDataView)

    this.ramBytes.fill(0xff)

    const ramBytes = SramSaver.loadFile(this.name)

    if (ramBytes?.length === this.ramSize) {
      this.ramBuffer = ramBytes.buffer
      this.ramView = new DataView(ramBytes.buffer)
      this.ramBytes = ramBytes
    }
  }

  ramBuffer = new ArrayBuffer(this.ramSize)
  ramView = new DataView(this.ramBuffer)
  ramBytes = new Uint8Array(this.ramBuffer)

  sramTimeout: ReturnType<typeof setTimeout>|null = null

  hasBattery = false

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
        if (this.sramTimeout != null) {
          clearTimeout(this.sramTimeout)
        }

        this.sramTimeout = setTimeout(() => SramSaver.saveFile(this.name, this.ramBytes), 1500)
      }
    },
    (address: number, value: number) => {
      this.ramView.setUint16(address, value, true)
      if (this.hasBattery) {
        if (this.sramTimeout != null) {
          clearTimeout(this.sramTimeout)
        }
        this.sramTimeout = setTimeout(() => SramSaver.saveFile(this.name, this.ramBytes), 1500)
      }
    }
  ]

  readByte(address: number): number {
    return this._read(address, ReadMethod.READ_BYTE)
  }

  readSignedByte(address: number): number {
    return this._read(address, ReadMethod.READ_SIGNED_BYTE)
  }

  readWord(address: number) {
    return this._read(address, ReadMethod.READ_WORD)
  }

  protected _read(address: number, readMethod: ReadMethod): number {
    return -1
  }

  writeByte(address: number, value: number) {
    this._write(address, value, WriteMethod.WRITE_BYTE)
  }

  writeWord(address: number, value: number) {
    this._write(address, value, WriteMethod.WRITE_WORD)
  }

  protected _write(address: number, value: number, writeMethod: WriteMethod) {
    return
  }
}