import { Gameboy } from "../Gameboy"
import { JoypadRegister, joypadRegister } from "./memory_registers/JoypadRegister"

const JOYPAD_REGISTER_ADDRESS = 0xff00

export class Memory {
  memoryBuffer = new ArrayBuffer(0x10000)
  memoryView = new DataView(this.memoryBuffer)
  memoryBytes = new Uint8Array(this.memoryBuffer)
  gameDataView?: DataView

  loadCartridge(gameDataView: DataView) {
    this.gameDataView = gameDataView
  }

  reset() {
    this.memoryBytes.fill(0, 0, this.memoryBytes.length - 1)
  }

  readByte(address: number): number {
    if (this.gameDataView == null) {
      throw new Error("game ROM not loaded into memory!")
    }
    if (this.isAccessingCartridge(address)) {
      return this.gameDataView.getUint8(address)
    }
    if (address === JOYPAD_REGISTER_ADDRESS) {
      return joypadRegister.getInput()
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
    if (address === JOYPAD_REGISTER_ADDRESS) {
      joypadRegister.value = value
      return
    }
    this.memoryView.setUint8(address, value)
   }

  writeWord(address: number, value: number) {
    this.memoryView.setUint16(address, value, true)
  }

  isAccessingCartridge(address: number): boolean {
    return address <= 0x7FFF || (address >= 0xA000 && address <= 0xBFFF)
  }
}