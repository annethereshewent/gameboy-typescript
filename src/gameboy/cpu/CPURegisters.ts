import { Memory } from "./Memory"

export class CPURegisters {
  A: CPURegister
  B: CPURegister
  C: CPURegister
  D: CPURegister
  E: CPURegister
  F: FlagsRegister
  H: CPURegister
  L: CPURegister

  AF: CPURegister
  BC: CPURegister
  DE: CPURegister
  HL: CPURegister

  SP: CPURegister
  PC: CPURegister

  registerPairs: CPURegister[]

  memory: Memory

  constructor(memory: Memory) {
    this.A = new CPURegister()
    this.B = new CPURegister()
    this.C = new CPURegister()
    this.D = new CPURegister()
    this.E = new CPURegister()
    this.F = new FlagsRegister()
    this.H = new CPURegister()
    this.L = new CPURegister()

    this.AF = new CPURegister()
    this.BC = new CPURegister()
    this.DE = new CPURegister()
    this.HL = new CPURegister()

    this.SP = new CPURegister()
    // first 255 (0xFF) instructions in memory are reserved for the gameboy
    this.PC = new CPURegister(0x100)

    this.registerPairs = [this.AF, this.BC, this.DE, this.HL]

    this.memory = memory
  }


  add(target: CPURegister, source: CPURegister) {
    const newValue = (target.value + source.value) & 0xff

    this.F.subtract = false
    this.F.zero = newValue === 0
    this.F.halfCarry = (newValue & 0x0f) < (target.value & 0x0f)
    this.F.carry = newValue < target.value

    target.value = newValue
  }

  complementCarryFlag() {
    this.F.subtract = false
    this.F.halfCarry = false

    this.F.carry = !this.F.carry
  }

  readByte(target: CPURegister) {
    target.value = this.memory.readByte(this.PC.value)
    this.PC.value++
  }

  loadByte(target: CPURegister, source: CPURegister) {
    target.value = this.memory.readByte(source.value)
  }

  loadByteAndIncrementSource(target: CPURegister, source: CPURegister) {
    target.value = this.memory.readByte(source.value)
    source.value++
  }

  loadWord(target: CPURegister) {
    target.value = this.memory.readWord(this.PC.value)
    this.PC.value += 2
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
    this.memory.writeByte(0xff00 + baseAddress, source.value)
  }

  writeToMemory16bit(source: CPURegister) {
    const memoryAddress = this.memory.readWord(this.PC.value)
    this.PC.value += 2
    this.memory.writeByte(memoryAddress, source.value)
  }

  writeToMemoryRegisterAddr(target: CPURegister, source: CPURegister) {
    this.memory.writeByte(target.value, source.value)
  }

  subtract(source: CPURegister) {
    const newValue = (this.A.value - source.value) & 0xff

    this.F.subtract = true
    this.F.zero = newValue === 0
    this.F.halfCarry = (newValue & 0x0f) > (this.A.value & 0x0f)
    this.F.carry = newValue > this.A.value

    this.A.value = newValue
  }

  load(target: CPURegister, source: CPURegister) {
    target.value = source.value
  }

  or(source: CPURegister) {
    const newValue = (this.A.value | source.value) & 0xff

    this.F.carry = false
    this.F.zero = newValue === 0
    this.F.halfCarry = false
    this.F.subtract = false

    this.A.value = newValue
  }

  and(source: CPURegister) {
    this.A.value = (this.A.value & source.value) & 0xff

    this.F.carry = false
    this.F.halfCarry = true
    this.F.subtract = false
    this.F.zero = this.A.value === 0
  }

  xor(source: CPURegister) {
    this.A.value = (this.A.value ^ source.value) & 0xff

    this.F.carry = false
    this.F.halfCarry = false
    this.F.subtract = false
    this.F.zero = this.A.value === 0
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
    this.F.carry = newValue > target.value

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
    this.memory.writeByte(target.value, source.value)

    target.value++
  }

  writeToMemoryRegisterAddrAndDecrementTarget(target: CPURegister, source: CPURegister) {
    this.memory.writeByte(target.value, source.value)

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

    this.memory.writeByte(target.value, newValue)
  }

  decrementMemoryValAtRegisterAddr(target: CPURegister) {
    const oldValue = this.memory.readByte(target.value)
    const newValue = (oldValue - 1) & 0xff

    this.F.subtract = true
    this.F.zero = newValue === 0
    this.F.halfCarry = (newValue & 0x0f) > (oldValue & 0x0f)
    this.F.carry = newValue > target.value

    this.memory.writeByte(target.value, newValue)
  }
}

const ZERO_FLAG_BYTE_POSITION = 7
const SUBTRACT_FLAG_BYTE_POSITION = 6
const HALF_CARRY_FLAG_BYTE_POSITION = 5
const CARRY_FLAG_BYTE_POSITION = 4

class FlagsRegister {
  get zero() {
    return ((this.value >> ZERO_FLAG_BYTE_POSITION) & 1) === 1
  }

  get subtract() {
    return ((this.value >> SUBTRACT_FLAG_BYTE_POSITION) & 1) === 1
  }

  get halfCarry() {
    return ((this.value >> HALF_CARRY_FLAG_BYTE_POSITION) & 1) === 1
  }

  get carry() {
    return ((this.value >> CARRY_FLAG_BYTE_POSITION) & 1) === 1
  }

  set zero(val: boolean) {
    if (val) {
      this.value |= 1 << ZERO_FLAG_BYTE_POSITION
    } else {
      this.value &= ~(1 << ZERO_FLAG_BYTE_POSITION)
    }
  }

  set subtract(val: boolean) {
    if (val) {
      this.value |= 1 << SUBTRACT_FLAG_BYTE_POSITION
    } else {
      this.value &= ~(1 << SUBTRACT_FLAG_BYTE_POSITION)
    }
  }

  set halfCarry(val: boolean) {
    if (val) {
      this.value |= 1 << HALF_CARRY_FLAG_BYTE_POSITION
    } else {
      this.value &= ~(1 << HALF_CARRY_FLAG_BYTE_POSITION)
    }
  }

  set carry(val: boolean) {
    if (val) {
      this.value |= 1 << CARRY_FLAG_BYTE_POSITION
    } else {
      this.value &= ~(1 << CARRY_FLAG_BYTE_POSITION)
    }
  }

  // the actual value that translates to the above
  value = 0
}

export class CPURegister {

  value: number
  constructor(value = 0) {
    this.value = value
  }
}