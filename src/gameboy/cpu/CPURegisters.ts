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

  constructor() {
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
  }


  add(source: CPURegister, target: CPURegister) {
    const newValue = (source.value + target.value) & 0xff

    this.F.subtract = false
    this.F.zero = newValue === 0
    this.F.halfCarry = (newValue & 0x0f) < (source.value & 0x0f)
    this.F.carry = newValue < source.value

    source.value = newValue
  }

  subtract(target: CPURegister) {
    const newValue = (this.A.value - target.value) & 0xff

    this.F.subtract = true
    this.F.zero = newValue === 0
    this.F.halfCarry = (newValue & 0x0f) > (this.A.value & 0x0f)
    this.F.carry = newValue > this.A.value

    this.A.value = newValue
  }

  load(source: CPURegister, target: CPURegister) {
    source.value = target.value

    // add debugging here also
  }

  and(target: CPURegister) {
    this.A.value = (this.A.value & target.value) & 0xff

    this.F.carry = false
    this.F.halfCarry = true
    this.F.subtract = false
    this.F.zero = this.A.value === 0
  }

  xor(target: CPURegister) {
    this.A.value = (this.A.value ^ target.value) & 0xff

    this.F.carry = false
    this.F.halfCarry = false
    this.F.subtract = false
    this.F.zero = this.A.value === 0
  }

  increment(source: CPURegister) {
    const newValue = (source.value + 1) & 0xff

    this.F.subtract = false
    this.F.zero = newValue === 0
    this.F.halfCarry = (newValue & 0x0f) < (source.value & 0x0f)

    source.value = newValue
  }

  decrement(source: CPURegister) {
    const newValue = (source.value - 1) & 0xff

    this.F.subtract = true
    this.F.zero = newValue === 0
    this.F.halfCarry = (newValue & 0x0f) > (source.value & 0x0f)
    this.F.carry = newValue > source.value

    source.value = newValue
  }

  add16Bit(source: CPURegister, target: CPURegister) {
    if (!this.registerPairs.includes(source) || !this.registerPairs.includes(target)) {
      throw Error("Invalid register pairs")
    }

    const newValue = (source.value + target.value) & 0xffff

    this.F.subtract = false
    this.F.zero = newValue === 0
    this.F.halfCarry = (newValue & 0xfff) < (source.value & 0xfff)
    this.F.carry = newValue < source.value

    source.value = newValue
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