import { Memory } from "./Memory"
import { InterruptEnableRegister } from "./memory_registers/InterruptEnableRegister"
import { InterruptRequestRegister } from "./memory_registers/InterruptRequestRegister"
import { CPURegister } from "./CPURegister"
import { JoypadRegister } from "./memory_registers/JoypadRegister"
import { FlagsRegister } from "./CPUFlagRegister"
import { FlagsRegisterPair } from "./FlagsRegisterPair"
import { Gameboy } from "../Gameboy"

export class CPURegisters {
  A: CPURegister
  B: CPURegister
  C: CPURegister
  D: CPURegister
  E: CPURegister
  F: FlagsRegister
  H: CPURegister
  L: CPURegister

  AF: FlagsRegisterPair
  BC: CPURegister
  DE: CPURegister
  HL: CPURegister

  SP: CPURegister
  PC: CPURegister

  interruptEnableRegister: InterruptEnableRegister
  interruptRequestRegister: InterruptRequestRegister
  joypadRegister: JoypadRegister

  registerPairs: CPURegister[]

  memory: Memory

  private registerDataView: DataView

  constructor(memory: Memory) {

    this.registerDataView = new DataView(new ArrayBuffer(12))

    this.A = new CPURegister("A", 0, 1, this.registerDataView, false)
    this.B = new CPURegister("B", 0, 3, this.registerDataView, false)
    this.C = new CPURegister("C", 0, 2, this.registerDataView, false)
    this.D = new CPURegister("D", 0, 5, this.registerDataView, false)
    this.E = new CPURegister("E", 0, 4, this.registerDataView, false)
    this.F = new FlagsRegister("F", 0, 0, this.registerDataView, false)
    this.H = new CPURegister("H", 0, 7, this.registerDataView,false)
    this.L = new CPURegister("L", 0, 6, this.registerDataView, false)


    // see http://bgb.bircd.org/pandocs.htm#powerupsequence for info on initial register values
    this.AF = new FlagsRegisterPair("AF", 0x1b0, 0, this.registerDataView, true)
    this.BC = new CPURegister("BC", 0x13, 2, this.registerDataView, true)
    this.DE = new CPURegister("DE", 0xd8, 4, this.registerDataView, true)
    this.HL = new CPURegister("HL", 0x14d, 6, this.registerDataView, true)
    // stack pointer starts at the top of the stack memory, which is at 0xfffe
    this.SP = new CPURegister("SP", 0xfffe, 8, this.registerDataView, true)
    // first 255 (0xFF) instructions in memory are reserved for the gameboy
    this.PC = new CPURegister("PC", 0x100, 10, this.registerDataView, true)

    this.registerPairs = [this.AF, this.BC, this.DE, this.HL]

    this.memory = memory

    // memory registers
    this.interruptEnableRegister = new InterruptEnableRegister(memory)
    this.interruptRequestRegister = new InterruptRequestRegister(memory)
    this.joypadRegister = new JoypadRegister(memory)
  }


  add(target: CPURegister, source: CPURegister) {
    target.value = this._add(target.value, source.value)
  }

  private _add(a: number, b: number): number {
    const newValue = (a + b) & 0xff

    this.F.subtract = false
    this.F.zero = newValue === 0
    this.F.halfCarry = (newValue & 0x0f) < (a & 0x0f)
    this.F.carry = newValue < a

    return newValue
  }

  private _subtract(a: number, b: number): number {
    const newValue = (a - b) & 0xff

    this.F.subtract = true
    this.F.zero = newValue === 0
    this.F.halfCarry = (newValue & 0x0f) > (a & 0x0f)
    this.F.carry = newValue > a

    return newValue
  }

  addImmediate(target: CPURegister) {
    const value = this.memory.readByte(this.PC.value)

    this.PC.value++

    target.value = this._add(target.value, value)
  }

  addFromRegisterAddr(target: CPURegister, source: CPURegister) {
    const value = this.memory.readByte(source.value)

    target.value = this._add(target.value, value)
  }

  addWithCarry(source: CPURegister) {
    const value = source.value + (this.F.carry ? 1 : 0)

    this.A.value = this._add(this.A.value, value)
  }

  addWithCarryImmediate() {
    this.A.value = this._add(this.A.value, this.memory.readByte(this.PC.value) + (this.F.carry ? 1 : 0))
    this.PC.value++
  }

  loadHLStackPointer() {
    const toAdd = this.memory.readSignedByte(this.PC.value)

    this.PC.value++

    const distanceFromWrappingBit3 = 0xf - (this.SP.value & 0x000f)
    const distanceFromWrappingBit7 = 0xff - (this.SP.value & 0x00ff)

    this.F.halfCarry = (toAdd & 0x0f) > distanceFromWrappingBit3
    this.F.carry = (toAdd & 0xff) > distanceFromWrappingBit7
    this.F.zero = false
    this.F.subtract = false

    this.HL.value = this.SP.value + toAdd
  }

  addWithCarryFromMemory(source: CPURegister) {
    const value = this.memory.readByte(source.value) + (this.F.carry ? 1 : 0)

    this.A.value = this._add(this.A.value, value)
  }

  complementCarryFlag() {
    this.F.subtract = false
    this.F.halfCarry = false

    this.F.carry = !this.F.carry
  }

  setCarryFlag() {
    this.F.subtract = false
    this.F.halfCarry = false
    this.F.carry = true
  }

  readByte(target: CPURegister) {
    target.value = this.memory.readByte(this.PC.value)

    this.PC.value++
  }

  loadFromBase(target: CPURegister) {
    const baseAddress = this.memory.readByte(this.PC.value)

    this.PC.value++

    target.value = this.memory.readByte(0xff00 + baseAddress)
  }

  loadFrom16bitAddr(target: CPURegister) {
    const memoryAddress = this.memory.readWord(this.PC.value)

    this.PC.value += 2

    target.value = this.memory.readByte(memoryAddress)
  }

  loadByte(target: CPURegister, source: CPURegister) {
    target.value = this.memory.readByte(source.value)
  }

  loadByteAndIncrementSource(target: CPURegister, source: CPURegister) {
    target.value = this.memory.readByte(source.value)
    source.value++
  }

  loadByteAndDecrementSource(target: CPURegister, source: CPURegister) {
    target.value = this.memory.readByte(source.value)
    source.value--
  }

  loadWord(target: CPURegister) {
    if (target.is16Bit) {
      target.value = this.memory.readWord(this.PC.value)
      this.PC.value += 2
    } else {
      throw new Error(`invalid register selected: ${target.name}. must be a 16 bit register.`)
    }
  }

  jump() {
    this.PC.value = this.memory.readWord(this.PC.value)
  }

  jumpToRegisterAddr() {
    this.PC.value = this.HL.value
  }

  jumpIfNotZero() {
    if (!this.F.zero) {
      this.PC.value = this.memory.readWord(this.PC.value)
    } else {
      this.PC.value += 2
    }
  }

  jumpIfZero() {
    if (this.F.zero) {
      this.PC.value = this.memory.readWord(this.PC.value)
    } else {
      this.PC.value += 2
    }
  }

  jumpIfNotCarry() {
    if (!this.F.carry) {
      this.PC.value = this.memory.readWord(this.PC.value)
    } else {
      this.PC.value += 2
    }
  }

  jumpIfCarry() {
    if (this.F.carry) {
      this.PC.value = this.memory.readWord(this.PC.value)
    } else {
      this.PC.value += 2
    }
  }

  relativeJump() {
    const jumpDistance = this.memory.readSignedByte(this.PC.value)

    this.PC.value++
    this.PC.value += jumpDistance
  }

  relativeJumpIfZero() {
    if (this.F.zero) {
      const jumpDistance = this.memory.readSignedByte(this.PC.value)
      this.PC.value++
      this.PC.value += jumpDistance
    } else {
      this.PC.value++
    }
  }

  relativeJumpIfNotZero() {
    if (!this.F.zero) {
      const jumpDistance = this.memory.readSignedByte(this.PC.value)
      this.PC.value++
      this.PC.value += jumpDistance
    } else {
      this.PC.value++
    }
  }

  relativeJumpIfCarry() {
    if (this.F.carry) {
      const jumpDistance = this.memory.readSignedByte(this.PC.value)
      this.PC.value++
      this.PC.value += jumpDistance
    } else {
      this.PC.value++
    }
  }

  relativeJumpIfNotCarry() {
    if (!this.F.carry) {
      const jumpDistance = this.memory.readSignedByte(this.PC.value)
      this.PC.value++
      this.PC.value += jumpDistance
    } else {
      this.PC.value++
    }
  }

  writeToMemory8Bit(source: CPURegister) {
    const baseAddress = this.memory.readByte(this.PC.value)
    this.PC.value++

    this.memory.writeByte(0xff00 + baseAddress, source.value, "writeToMemory8Bit")
  }

  writeToMemory16bit(source: CPURegister) {
    const memoryAddress = this.memory.readWord(this.PC.value)
    this.PC.value += 2

    this.memory.writeByte(memoryAddress, source.value, "writeToMemory16bit")
  }

  writeStackPointerToMemory() {
    const memoryAddress = this.memory.readWord(this.PC.value)

    this.PC.value += 2

    this.memory.writeWord(memoryAddress, this.SP.value)
  }

  writeToMemoryRegisterAddr(target: CPURegister, source: CPURegister) {
    if (target.is16Bit) {
      this.memory.writeByte(target.value, source.value, "writeToMemoryRegisterAddr")
    } else {
      throw new Error(`invalid register selected: ${target.name}; need a 16 bit register.`)
    }
  }

  writeToMemoryRegisterAddr8bit(target: CPURegister, source: CPURegister) {
    if (!target.is16Bit) {
      this.memory.writeByte(0xff00 + target.value, source.value, "writeToMemoryRegisterAddr8Bit")
    } else {
      throw new Error(`invalid register selected: ${target.name} need an 8 bit register.`)
    }
  }

  writeByteIntoRegisterAddress(target: CPURegister) {
    if (target.is16Bit) {
      this.memory.writeByte(target.value, this.memory.readByte(this.PC.value), "writeByteIntoRegisterAddr")
      this.PC.value++
    } else {
      throw new Error(`invalid register selected: ${target.name}; need a 16 bit register.`)
    }

  }

  subtract(source: CPURegister) {
    this.A.value = this._subtract(this.A.value, source.value)
  }

  subtractImmediate() {
    this.A.value = this._subtract(this.A.value, this.memory.readByte(this.PC.value))

    this.PC.value++
  }

  subtractWithCarry(source: CPURegister) {
    const value = source.value - (this.F.carry ? 1 : 0)

    this.A.value = this._subtract(this.A.value, value)
  }

  subtractWithCarryFromMemory(source: CPURegister) {
    const value = this.memory.readByte(source.value) - (this.F.carry ? 1 : 0)

    this.A.value = this._subtract(this.A.value, value)
  }

  subtractWithCarryImmediate() {
    const value = this.memory.readByte(this.PC.value) - (this.F.carry ? 1 : 0)

    this.PC.value++

    this.A.value = this._subtract(this.A.value, value)
  }

  compare(source: CPURegister) {
    // do subtract operation but don't store the value. the flags changing are what's important
    this._subtract(this.A.value, source.value)
  }

  compareImmediate() {
    this._subtract(this.A.value, this.memory.readByte(this.PC.value))

    this.PC.value++
  }

  compareFromRegisterAddr(source: CPURegister) {
    const compareTo = this.memory.readByte(source.value)

    this._subtract(this.A.value, compareTo)
  }

  subtractFromMemory(source: CPURegister) {
    const value = this.memory.readByte(source.value)

    this.A.value = this._subtract(this.A.value, value)
  }

  load(target: CPURegister, source: CPURegister) {
    target.value = source.value
  }

  private _or(a: number, b: number) {
    const newValue = (a| b) & 0xff

    this.F.carry = false
    this.F.zero = newValue === 0
    this.F.halfCarry = false
    this.F.subtract = false

    return newValue
  }

  or(source: CPURegister) {
    this.A.value = this._or(this.A.value, source.value)
  }

  orFromMemory(source: CPURegister) {
    this.A.value = this._or(this.A.value, this.memory.readByte(source.value))
  }

  orImmediate() {
    this.A.value = this._or(this.A.value, this.memory.readByte(this.PC.value))

    this.PC.value++
  }

  private _and(a: number, b: number): number {
    const returnVal = (a & b) & 0xff

    this.F.carry = false
    this.F.halfCarry = true
    this.F.subtract = false
    this.F.zero = returnVal === 0

    return returnVal
  }

  and(source: CPURegister) {
    this.A.value = this._and(this.A.value, source.value)
  }

  andFromMemory(source: CPURegister) {
    this.A.value = this._and(this.A.value, this.memory.readByte(source.value))
  }

  andImmediate() {
    this.A.value = this._and(this.A.value, this.memory.readByte(this.PC.value))

    this.PC.value++
  }

  private _xor(a: number, b: number): number {
    const returnVal = (a ^ b) & 0xff

    this.F.carry = false
    this.F.halfCarry = false
    this.F.subtract = false
    this.F.zero = returnVal === 0

    return returnVal
  }

  xor(source: CPURegister) {
    this.A.value = this._xor(this.A.value, source.value)
  }

  xorImmediate() {
    this.A.value = this._xor(this.A.value, this.memory.readByte(this.PC.value))

    this.PC.value++
  }

  xorFromMemory(source: CPURegister) {
    this.A.value = this._xor(this.A.value, this.memory.readByte(source.value))
  }

  increment(target: CPURegister) {
    const newValue = (target.value + 1) & 0xff

    this.F.subtract = false
    this.F.zero = newValue === 0
    this.F.halfCarry = (newValue & 0x0f) < (target.value & 0x0f)

    target.value = newValue
  }

  decrement(target: CPURegister) {
    const newValue = (target.value - 1) & 0xff

    this.F.subtract = true
    this.F.zero = newValue === 0
    this.F.halfCarry = (newValue & 0x0f) > (target.value & 0x0f)

    target.value = newValue
  }

  add16Bit(target: CPURegister, source: CPURegister) {
    if (!this.registerPairs.includes(target) || !this.registerPairs.includes(source)) {
      throw new Error("Invalid register pairs")
    }

    const newValue = (target.value + source.value) & 0xffff

    this.F.subtract = false
    this.F.zero = newValue === 0
    this.F.halfCarry = (newValue & 0xfff) < (target.value & 0xfff)
    this.F.carry = newValue < target.value

    target.value = newValue
  }

  rotateLeft() {
    const bit7 = this.A.value >> 7

    this.F.carry = bit7 === 1
    this.F.halfCarry = false
    this.F.zero = false
    this.F.subtract = false

    this.A.value = (this.A.value << 1) + bit7
  }

  rotateLeftCarry() {
    const bit7 = this.A.value >> 7
    const result = (this.A.value << 1) + (this.F.carry ? 1 : 0)

    this.F.carry = bit7 === 1
    this.F.halfCarry = false
    this.F.subtract = false
    this.F.zero = false

    this.A.value = result
  }

  rotateRight() {
    const bit0 = this.A.value & 1

    this.F.carry = bit0 === 1
    this.F.halfCarry = false
    this.F.zero = false
    this.F.subtract = false

    this.A.value = (this.A.value >> 1) + (bit0 << 7)
  }

  rotateRightCarry() {
    const bit0 = this.A.value & 1

    this.F.carry = bit0 === 1
    this.F.zero = false
    this.F.halfCarry = false
    this.F.subtract = false

    this.A.value = (this.A.value >> 1) + ((this.F.carry ? 1 : 0) << 7)
  }

  writeToMemoryRegisterAddrAndIncrementTarget(target: CPURegister, source: CPURegister) {
    this.memory.writeByte(target.value, source.value, "writeToMemoryRegisterAddrAndIncrementTarget")

    target.value++
  }

  writeToMemoryRegisterAddrAndDecrementTarget(target: CPURegister, source: CPURegister) {
    this.memory.writeByte(target.value, source.value, "writeToMemoryRegisterAddrAndDecrementTarget")

    target.value--
  }

  decimalAdjustAccumulator() {
    const { A, F } = this
    const onesPlaceCorrector = F.subtract ? -0x06 : 0x06
    const tensPlaceCorrector = F.subtract ? -0x60 : 0x60

    const isAdditionBcdHalfCarry = !F.subtract && (A.value & 0x0f) > 9
    const isAdditionBcdCarry = !F.subtract && A.value > 0x99

      if (F.halfCarry || isAdditionBcdHalfCarry) {
        A.value += onesPlaceCorrector
      }

      if (F.carry || isAdditionBcdCarry) {
        A.value += tensPlaceCorrector
        F.carry = true
      }

      F.zero = A.value === 0
      F.halfCarry = false
  }

  complementAccumulator() {
    this.A.value = ~this.A.value

    this.F.subtract = true
    this.F.halfCarry = true
  }

  incrementMemoryValAtRegisterAddr(target: CPURegister) {
    const oldValue = this.memory.readByte(target.value)
    const newValue = (oldValue + 1) & 0xff

    this.F.subtract = false
    this.F.zero = newValue === 0
    this.F.halfCarry = (newValue & 0x0f) < (oldValue & 0x0f)

    this.memory.writeByte(target.value, newValue, "incrementMemoryValAtRegisterAddr")
  }

  decrementMemoryValAtRegisterAddr(target: CPURegister) {
    const oldValue = this.memory.readByte(target.value)
    const newValue = (oldValue - 1) & 0xff

    this.F.subtract = true
    this.F.zero = newValue === 0
    this.F.halfCarry = (newValue & 0x0f) > (oldValue & 0x0f)
    this.F.carry = newValue > target.value

    this.memory.writeByte(target.value, newValue, "decrementMemoryValAtRegisterAddr")
  }

  callFunction() {
    const address = this.memory.readWord(this.PC.value)

    this.PC.value += 2

    this.pushToStack(this.PC.value)

    this.PC.value = address
  }

  callFunctionIfNotZero() {
    if (!this.F.zero) {
      this.callFunction()
    }
  }

  callFunctionIfZero() {
    if (this.F.zero) {
      this.callFunction()
    }
  }

  callFunctionIfNotCarry() {
    if (!this.F.carry) {
      this.callFunction()
    }
  }

  callFunctionIfCarry() {
    if (this.F.carry) {
      this.callFunction()
    }
  }

  returnFromFunction() {
    this.PC.value = this.popFromStack()
  }

  returnFromFunctionIfNotZero() {
    if (!this.F.zero) {
      this.returnFromFunction()
    }
  }

  returnFromFunctionIfZero() {
    if (this.F.zero) {
      this.returnFromFunction()
    }
  }

  returnFromFunctionIfCarry() {
    if (this.F.carry) {
      this.returnFromFunction()
    }
  }

  returnFromFunctionIfNotCarry() {
    if (!this.F.carry) {
      this.returnFromFunction()
    }
  }

  popFromStack(): number {
    const returnVal = this.memory.readWord(this.SP.value)

    this.SP.value += 2

    return returnVal
  }

  restart(address: number) {
    this.pushToStack(this.PC.value)

    this.PC.value = address
  }

  pushToStack(value: number) {
    this.SP.value -= 2
    this.memory.writeWord(this.SP.value, value)
  }

  popToRegister(target: CPURegister) {
    target.value = this.popFromStack()
  }

  pushFromRegister(source: CPURegister) {
    this.pushToStack(source.value)
  }

  swap(target: CPURegister) {
    const higherBit = (target.value >> 7) & 1
    const lowerBit = target.value & 1

    target.setBit(0, higherBit)
    target.setBit(7, lowerBit)
  }

  resetBit(bitPos: number, target: CPURegister) {
    target.value = target.value & ~(0b1 << bitPos)
  }
}
