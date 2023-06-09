import { Cartridge } from "../cartridge/Cartridge"
import { CartridgeType } from "../cartridge/CartridgeType"
import { Mbc1Cartridge } from "../cartridge/Mbc1Cartridge"
import { Mbc2Cartridge } from "../cartridge/Mbc2Cartridge"
import { Mbc3Cartridge } from "../cartridge/Mbc3Cartridge"
import { Mbc5Cartridge } from "../cartridge/Mbc5Cartridge"
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
  private memoryBuffer = new ArrayBuffer(0x10000)
  private memoryView = new DataView(this.memoryBuffer)
  private memoryBytes = new Uint8Array(this.memoryBuffer)

  static BgpdRegisterAddress = 0xff69
  static ObpdRegisterAddress = 0xff6b

  backgroundPaletteIndexRegister = new BackgroundPaletteIndexRegister(this)
  objectPaletteIndexRegister = new ObjectPaletteIndexRegister(this)

  initialHdmaSourceAddress = 0
  initialHdmaDestinationAddress = 0

  currentHdmaSourceAddress = -1
  currentHdmaDestinationAddress = -1

  currentTransferLength = -1

  private vramBank1Buffer = new ArrayBuffer(0x2000)
  private vramView = new DataView(this.vramBank1Buffer)
  private vramBytes = new Uint8Array(this.vramBank1Buffer)

  private backgroundPaletteRam = new ArrayBuffer(0x40)
  private backgroundPaletteView = new DataView(this.backgroundPaletteRam)
  private backgroundPaletteBytes = new Uint8Array(this.backgroundPaletteRam)

  private objectPaletteRam = new ArrayBuffer(0x40)
  private objectPaletteView = new DataView(this.objectPaletteRam)
  private objectPaletteBytes = new Uint8Array(this.objectPaletteRam)

  cartridge?: Cartridge

  isGBC?: boolean

  wramBankBuffers: ArrayBuffer[] = []
  wramBankViews: DataView[] = []
  wramBankBytes: Uint8Array[] = []

  // create the wram banks
  constructor() {
    for (let i = 1; i < 8; i++) {
      const arrayBuffer = new ArrayBuffer(0x1000)
      this.wramBankBuffers[i] = arrayBuffer
      this.wramBankViews[i] = new DataView(arrayBuffer)
      this.wramBankBytes[i] = new Uint8Array(arrayBuffer)
    }
  }

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
      case CartridgeType.MBC5:
      case CartridgeType.MBC5_PLUS_RAM:
      case CartridgeType.MBC5_PLUS_RAM_PLUS_BATTERY:
        this.cartridge = new Mbc5Cartridge(gameDataView)
        break
      default:
        throw new Error(`Cartridge type not supported: ${cartridgeType}`)
    }

    this.isGBC = this.cartridge.isGameboyColor()

    return this.isGBC
  }

  get wramBank() {
    const val = this.readByte(0xff70)
    return val === 0 ? 1 : val & 0b111
  }

  set wramBank(newVal: number) {
    const actualVal = (newVal & 0b111) === 0 ? 1 : newVal
    this.writeByte(0xff70, actualVal & 0b111)
  }

  reset() {
    this.memoryBytes.fill(0, 0, this.memoryBytes.length - 1)
    this.vramBytes.fill(0, 0, this.vramBytes.length - 1)
    this.backgroundPaletteBytes.fill(0, 0, this.backgroundPaletteBytes.length - 1)
    this.objectPaletteBytes.fill(0, 0, this.objectPaletteBytes.length - 1)
  }

  readByte(address: number, vramBankNumber?: number): number {
    const vramBank = vramBankNumber != null ? vramBankNumber : this.vramBank
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
    if (this.isVram(address) && vramBank === 1) {
      return this.vramView.getUint8(address - 0x8000)
    }
    if (this.isWramBanks(address)) {
      return this.wramBankViews[this.wramBank].getUint8(address - 0xd000)
    }

    return this.memoryView.getUint8(address)
  }

  get vramBank() {
    return this.memoryView.getUint8(0xff4f) & 0b1
  }

  readSignedByte(address: number): number {
    if (this.cartridge == null) {
      throw new Error("game ROM not loaded into memory!")
    }
    if (this.isAccessingCartridge(address)) {
      return this.cartridge.readSignedByte(address)
    }
    if (this.isVram(address) && this.vramBank === 1) {
      return this.vramView.getInt8(address - 0x8000)
    }
    if (this.isWramBanks(address)) {
      return this.wramBankViews[this.wramBank].getInt8(address - 0xd000)
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
    if (this.isWramBanks(address)) {
      return this.wramBankViews[this.wramBank].getUint16(address - 0xd000, true)
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
    if (this.isWramBanks(address)) {
      this.wramBankViews[this.wramBank].setUint8(address - 0xd000, value)
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
    if (this.isWramBanks(address)) {
      this.wramBankViews[this.wramBank].setUint16(address - 0xd000, value, true)
      return
    }
    this.memoryView.setUint16(address, value, true)
  }

  private isAccessingCartridge(address: number): boolean {
    return address <= 0x7FFF || (address >= 0xA000 && address <= 0xBFFF)
  }

  private isVram(address: number): boolean {
    return address >= 0x8000 && address <= 0x9fff
  }

  private isWramBanks(address: number): boolean {
    return address >= 0xd000 && address <= 0xdfff
  }

  // see http://www.codeslinger.co.uk/pages/projects/gameboy/dma.html
  private doDmaTransfer(value: number) {
    const address = value << 8

    for (let i = 0; i < 0xa0; i++) {
      this.writeByte(0xFE00+i, this.readByte(address+i))
    }
  }

  // see https://gbdev.io/pandocs/CGB_Registers.html
  private doHdmaTransfer(value: number) {
    const transferLength = ((value & 0b1111111) + 1) * 0x10
    const transferType = getBit(value, 7)

    const destinationStartAddress = this.hdmaDestinationAddress
    const sourceStartAddress = this.hdmaSourceAddress

    if (transferType === TransferType.GeneralPurpose) {
      this.doGeneralPurposeHdma(sourceStartAddress, destinationStartAddress, transferLength)
    } else {
      this.currentHdmaDestinationAddress = -1
      this.currentHdmaSourceAddress = -1
      this.initialHdmaSourceAddress = sourceStartAddress
      this.initialHdmaDestinationAddress = destinationStartAddress
      this.currentTransferLength = transferLength
    }
  }

  private get hdmaDestinationAddress() {
    const upperByte = this.readByte(0xff53) & 0b11111
    const lowerByte = this.readByte(0xff54) & 0b11110000

    return ((upperByte << 8) + lowerByte)
  }

  private set hdmaDestinationAddress(newAddress: number) {
    const upperByte = (newAddress >> 8) & 0b11111
    const lowerByte = newAddress & 0b11110000

    this.writeByte(0xff53, upperByte)
    this.writeByte(0xff54, lowerByte)
  }

  private get hdmaSourceAddress() {
    const upperByte = this.readByte(0xff51)
    const lowerByte = this.readByte(0xff52) & 0b11110000

    return ((upperByte << 8) + lowerByte)
  }

  private set hdmaSourceAddress(newAddress: number) {
    const upperByte = (newAddress >> 8)
    const lowerByte = newAddress & 0b11110000

    this.writeByte(0xff51, upperByte)
    this.writeByte(0xff52, lowerByte)
  }

  private doGeneralPurposeHdma(sourceStartAddress: number, destinationStartAddress: number, transferLength: number) {
    const actualDestinationStartAddress = destinationStartAddress | 0x8000

    for (let i = 0; i < transferLength; i++) {
      this.writeByte(actualDestinationStartAddress + i, this.readByte(sourceStartAddress + i))
    }

    // transfer completed
    this.writeByte(0xff55, 0xff)
    this.hdmaDestinationAddress += transferLength
    this.hdmaSourceAddress += transferLength
  }

  doHblankHdmaTransfer() {
    if (this.currentTransferLength === 0) {
      return
    }
    if (this.currentHdmaDestinationAddress === -1) {
      this.currentHdmaDestinationAddress = this.initialHdmaDestinationAddress
    }
    if (this.currentHdmaSourceAddress === -1) {
      this.currentHdmaSourceAddress = this.initialHdmaSourceAddress
    }

    const actualDestinationStart = this.currentHdmaDestinationAddress | 0x8000

    for (let i = 0; i < 0x10; i++) {
      this.writeByte(actualDestinationStart + i, this.readByte(this.currentHdmaSourceAddress + i))
    }

    this.hdmaDestinationAddress += 0x10
    this.hdmaSourceAddress += 0x10

    this.currentTransferLength -= 0x10

    this.currentHdmaDestinationAddress = this.hdmaDestinationAddress
    this.currentHdmaSourceAddress = this.hdmaSourceAddress
  }
}