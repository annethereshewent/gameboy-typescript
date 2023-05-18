import { Gameboy } from "../Gameboy"
import { Cartridge } from "../cartridge/Cartridge"
import { CartridgeType } from "../cartridge/CartridgeType"
import { Mbc1Cartridge } from "../cartridge/Mbc1Cartridge"
import { Mbc2Cartridge } from "../cartridge/Mbc2Cartridge"
import { Mbc3Cartridge } from "../cartridge/Mbc3Cartridge"
import { BackgroundPaletteIndexRegister } from "../gpu/registers/BackgroundPaletteIndexRegister"
import { ObjectPaletteIndexRegister } from "../gpu/registers/ObjectPaletteIndexRegister"
import { getBit } from "../misc/BitOperations"
import { joypadRegister } from "./memory_registers/JoypadRegister"

const JOYPAD_REGISTER_ADDRESS = 0xff00
const DMA_TRANSFER_ADDRESS = 0xff46
const DIVIDER_REGISTER_ADDRESS = 0xff04

const CARTRIDGE_TYPE_ADDRESS = 0x147

const HDMA_TRANSFER_ADDRESS = 0xff55

enum TransferType {
  GeneralPurpose,
  Hblank
}

export class Memory {
  memoryBuffer = new ArrayBuffer(0x10000)
  memoryView = new DataView(this.memoryBuffer)
  memoryBytes = new Uint8Array(this.memoryBuffer)

  static BgpdRegisterAddress = 0xff69
  static ObpdRegisterAddress = 0xff6b

  backgroundPaletteIndexRegister = new BackgroundPaletteIndexRegister(this)
  objectPaletteIndexRegister = new ObjectPaletteIndexRegister(this)

  vramBank1Buffer = new ArrayBuffer(0x2000)
  vramView = new DataView(this.vramBank1Buffer)
  vramBytes = new Uint8Array(this.vramBank1Buffer)

  backgroundPaletteRam = new ArrayBuffer(0x40)
  backgroundPaletteView = new DataView(this.backgroundPaletteRam)
  backgroundPaletteBytes = new Uint8Array(this.backgroundPaletteRam)

  objectPaletteRam = new ArrayBuffer(0x40)
  objectPaletteView = new DataView(this.objectPaletteRam)
  objectPaletteBytes = new Uint8Array(this.objectPaletteRam)

  cartridge?: Cartridge

  isGBC?: boolean

  loadCartridge(gameDataView: DataView) {
    const cartridgeType = gameDataView.getUint8(CARTRIDGE_TYPE_ADDRESS) as CartridgeType

    switch (cartridgeType) {
      case CartridgeType.ROM:
        this.cartridge = new Cartridge(gameDataView)
        break
      case CartridgeType.MBC1:
      case CartridgeType.MBC1_PLUS_RAM:
      case CartridgeType.MBC1_PLUS_RAM_PLUS_BATTERY:
        this.cartridge = new Mbc1Cartridge(gameDataView)
        break
      case CartridgeType.MBC2:
      case CartridgeType.MBC2_PLUS_BATTERY:
        this.cartridge = new Mbc2Cartridge(gameDataView)
        break
      case CartridgeType.MBC3:
      case CartridgeType.MBC3_PLUS_RAM:
      case CartridgeType.MBC3_PLUS_RAM_PLUS_BATTERY:
      case CartridgeType.MBC3_PLUS_TIMER_PLUS_BATTERY:
      case CartridgeType.MBC3_PLUS_TIMER_PLUS_RAM_PLUS_BATTERY:
        this.cartridge = new Mbc3Cartridge(gameDataView)
        break
      default:
        throw new Error(`Cartridge type not supported: ${cartridgeType}`)
    }

    this.isGBC = this.cartridge.isGameboyColor()

    return this.isGBC
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
    if (address === Memory.BgpdRegisterAddress) {
      return this.backgroundPaletteView.getUint8(this.backgroundPaletteIndexRegister.paletteAddress)
    }
    if (address === Memory.ObpdRegisterAddress) {
      return this.objectPaletteView.getUint8(this.objectPaletteIndexRegister.paletteAddress)
    }
    if (address === JOYPAD_REGISTER_ADDRESS) {
      return joypadRegister.getInput()
    }
    if (this.isVram(address) && this.vramBank === 1) {
      return this.vramView.getUint8(address - 0x8000)
    }

    return this.memoryView.getUint8(address)
  }

  get vramBank() {
    return this.memoryView.getUint8(0xff4f) & 0b1
  }

  set vramBank(newVal) {
    this.memoryView.setUint8(0xff4f, newVal)
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
    if (this.isVram(address) && this.vramBank === 1) {
      return this.vramView.getUint16(address - 0x8000, true)
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

    if (address === Memory.BgpdRegisterAddress) {
      this.backgroundPaletteView.setUint8(this.backgroundPaletteIndexRegister.paletteAddress, value)
      if (this.backgroundPaletteIndexRegister.autoIncrement) {
        this.backgroundPaletteIndexRegister.paletteAddress++
      }
      return
    }

    if (address === Memory.ObpdRegisterAddress) {
      this.objectPaletteView.setUint8(this.objectPaletteIndexRegister.paletteAddress, value)
      if (this.objectPaletteIndexRegister.autoIncrement) {
        this.objectPaletteIndexRegister.paletteAddress++
      }
      return
    }

    if (this.isVram(address) && this.vramBank === 1) {
      this.vramView.setUint8(address - 0x8000, value)
      return
    }

    this.memoryView.setUint8(address, value)

    if (address === DMA_TRANSFER_ADDRESS) {
      this.doDmaTransfer(value)
    }
    if (address === HDMA_TRANSFER_ADDRESS) {
      this.doHdmaTransfer(value)
    }
   }

  writeWord(address: number, value: number) {
    if (this.isAccessingCartridge(address)) {
      this.cartridge?.writeWord(address, value)
      return
    }
    if (this.isVram(address) && this.isGBC && this.vramBank === 1) {
      this.vramView.setUint16(address - 0x8000, value, true)
      return
    }
    this.memoryView.setUint16(address, value, true)
  }

  isAccessingCartridge(address: number): boolean {
    return address <= 0x7FFF || (address >= 0xA000 && address <= 0xBFFF)
  }

  isVram(address: number): boolean {
    return address >= 0x8000 && address <= 0x9fff
  }

  // see http://www.codeslinger.co.uk/pages/projects/gameboy/dma.html
  doDmaTransfer(value: number) {
    const address = value << 8

    for (let i = 0; i < 0xa0; i++) {
      this.writeByte(0xFE00+i, this.readByte(address+i))
    }
  }

  // see https://gbdev.io/pandocs/CGB_Registers.html
  doHdmaTransfer(value: number) {
    const transferLength = ((value & 0b1111111) + 1) * 0x10
    const transferType = getBit(value, 7)

    const upperByteDestination = this.readByte(0xff53)
    const lowerByteDestination = this.readByte(0xff54)

    const destinationStartAddress = ((upperByteDestination << 8) + lowerByteDestination) & 0b1111111111110000

    const upperByteSource = this.readByte(0xff51)
    const lowerByteSource = this.readByte(0xff52)

    const sourceStartAddress = ((upperByteSource << 8) + lowerByteSource) & 0b1111111111110000

    if (transferType === TransferType.GeneralPurpose) {

    } else if (transferType === TransferType.Hblank) {

    }
  }
}
