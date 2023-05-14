import { Cartridge } from "../cartridge/Cartridge"
import { Mbc1Cartridge } from "../cartridge/Mbc1Cartridge"
import { joypadRegister } from "./memory_registers/JoypadRegister"

const JOYPAD_REGISTER_ADDRESS = 0xff00
const DMA_TRANSFER_ADDRESS = 0xff46
const DIVIDER_REGISTER_ADDRESS = 0xff04

/**
 * per https://gbdev.io/pandocs/The_Cartridge_Header.html
 */
enum CartridgeType {
  ROM,
  MBC1,
  MBC1_PLUS_RAM,
  MBC_PLUS_RAM_PLUS_BATTERY,
  MBC2 = 0x5,
  MBC2_PLUS_BATTERY,
  ROM_PLUS_RAM_1 = 0x8,
  ROM_PLUS_RAM_PLUS_BATTERY_1,
  MM01 = 0xb,
  MM01_PLUS_RAM,
  MMO1_PLUS_RAM_PLUS_BATTERY,
  MBC3_PLUS_TIMER_PLUS_BATTERY = 0xf,
  MBC3_PLUS_TIMER_PLUS_RAM_PLUS_BATTERY_2,
  MBC3,
  MB3_PLUS_RAM_2,
  MBC3_PLUS_RAM_PLUS_BATTERY_2,
  MBC_5 = 0x19,
  MBC5_PLUS_RAM,
  MBC5_PLUS_RAM_PLUS_BATTERY,
  MBC5_PLUS_RUMBLE,
  MB5_PLUS_RUMBLE_PLUS_RAM,
  MBC5_PLUS_RUMBLE_PLUS_RAM_PLUS_BATTERY,
  MBC6 = 0x20,
  MBC7_PLUS_SENSOR_PLUS_RUMBLE_PLUS_RAM_PLUS_BATTERY = 0x22,
  POCKET_CAMERA = 0xfc,
  BANDAI_TAMA5,
  HuC3,
  HuC1_PLUS_RAM_PLUS_BATTERY
}

export class Memory {
  memoryBuffer = new ArrayBuffer(0x10000)
  memoryView = new DataView(this.memoryBuffer)
  memoryBytes = new Uint8Array(this.memoryBuffer)
  cartridge?: Cartridge

  loadCartridge(gameDataView: DataView) {
    console.log(gameDataView.getUint8(0x147))

    const cartridgeType = gameDataView.getUint8(0x147) as CartridgeType

    switch (cartridgeType) {
      case CartridgeType.ROM:
        this.cartridge = new Cartridge(gameDataView)
        break
      case CartridgeType.MBC1:
        this.cartridge = new Mbc1Cartridge(gameDataView)
        break
      default:
        throw new Error(`Cartridge type not supported: ${cartridgeType}`)
    }
  }

  reset() {
    this.memoryBytes.fill(0, 0, this.memoryBytes.length - 1)
  }

  readByte(address: number): number {
    if (this.cartridge == null) {
      throw new Error("game ROM not loaded into memory!")
    }
    if (this.isAccessingCartridge(address)) {
      return this.cartridge.readByte(address)
    }
    if (address === JOYPAD_REGISTER_ADDRESS) {
      return joypadRegister.getInput()
    }

    return this.memoryView.getUint8(address)
  }

  readSignedByte(address: number): number {
    if (this.cartridge == null) {
      throw new Error("game ROM not loaded into memory!")
    }
    if (this.isAccessingCartridge(address)) {
      return this.cartridge.readSignedByte(address)
    }
    return this.memoryView.getInt8(address)
  }

  readWord(address: number): number {
    if (this.cartridge == null) {
      throw new Error("game ROM not loaded into memory!")
    }
    if (this.isAccessingCartridge(address)) {
      return this.cartridge.readWord(address)
    }
    return this.memoryView.getUint16(address, true)
  }

  writeByte(address: number, value: number, caller?: string, canOverrideDivReg: boolean = false) {
    if (this.isAccessingCartridge(address)) {
      this.cartridge?.writeByte(address, value)
      return
    }
    if (address === JOYPAD_REGISTER_ADDRESS) {
      joypadRegister.value = value
      return
    }

    if (address === DIVIDER_REGISTER_ADDRESS && !canOverrideDivReg) {
      this.memoryView.setUint8(address, 0)
      return
    }

    this.memoryView.setUint8(address, value)

    if (address === DMA_TRANSFER_ADDRESS) {
      this.doDmaTransfer(value)
    }
   }

  writeWord(address: number, value: number) {
    if (this.isAccessingCartridge(address)) {
      this.cartridge?.writeWord(address, value)
      return
    }
    this.memoryView.setUint16(address, value, true)
  }

  isAccessingCartridge(address: number): boolean {
    return address <= 0x7FFF || (address >= 0xA000 && address <= 0xBFFF)
  }

  // see http://www.codeslinger.co.uk/pages/projects/gameboy/dma.html
  doDmaTransfer(value: number) {
    const address = value << 8

    for (let i = 0; i < 0xa0; i++) {
      this.writeByte(0xFE00+i, this.readByte(address+i))
    }
  }
}
