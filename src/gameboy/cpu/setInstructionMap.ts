import { CPU } from "./CPU"

export function setInstructionMap(this: CPU) {

  const { registers, memory } = this

  this.instructionMap.set(0x0, {
    name: "NOP",
    cycleTime: 4,
    operation() {
      // NOP
    }
  })

  this.instructionMap.set(0x1, {
    get name() {
      return `LD BC, 0x${memory.readWord(registers.PC.value).toString(16)}`
    },
    cycleTime: 12,
    operation: () => {
      this.registers.loadWord(this.registers.BC)
    }
  })

  this.instructionMap.set(0x2, {
    name: "LD (BC), A",
    cycleTime: 8,
    operation: () => {
      this.registers.writeToMemoryRegisterAddr(this.registers.BC, this.registers.A)
    }
  })

  this.instructionMap.set(0x3, {
    name: "INC BC",
    cycleTime: 8,
    operation: () => {
      this.registers.BC.value++
    }
  })

  this.instructionMap.set(0x4, {
    name: "INC B",
    cycleTime: 4,
    operation: () => {
      this.registers.increment(this.registers.B)
    }
  })

  this.instructionMap.set(0x5, {
    name: "DEC B",
    cycleTime: 4,
    operation: () => {
      this.registers.decrement(this.registers.B)
    }
  })

  this.instructionMap.set(0x6, {
    get name() {
      return `LD B, 0x${memory.readByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 8,
    operation: () =>  {
      this.registers.readByte(this.registers.B)
    }
  })

  this.instructionMap.set(0x7, {
    name: "RLCA",
    cycleTime: 4,
    operation: () => {
      this.registers.rotateLeft()
    }
  })

  this.instructionMap.set(0x8, {
    get name() {
      return `LD (0x${memory.readWord(registers.PC.value).toString(16)}), SP`
    },
    cycleTime: 20,
    operation: () => {
      this.registers.writeStackPointerToMemory()
    }
  })

  this.instructionMap.set(0x9, {
    name: "ADD HL, BC",
    cycleTime: 8,
    operation: () => {
      this.registers.add16Bit(this.registers.HL, this.registers.BC)
    }
  })

  this.instructionMap.set(0xA, {
    name: "LD A, (BC)",
    cycleTime: 8,
    operation: () => {
      this.registers.loadByte(this.registers.A, this.registers.BC)
    }
  })

  this.instructionMap.set(0xB, {
    name: "DEC BC",
    cycleTime: 8,
    operation: () => {
      this.registers.BC.value--
    }
  })

  this.instructionMap.set(0xC, {
    name: "INC C",
    cycleTime: 4,
    operation: () => {
      this.registers.increment(this.registers.C)
    }
  })

  this.instructionMap.set(0xD, {
    name: "DEC C",
    cycleTime: 4,
    operation: () => {
      this.registers.decrement(this.registers.C)
    }
  })

  this.instructionMap.set(0xE, {
    get name() {
      return `LD C, 0x${memory.readByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 8,
    operation: () => {
      this.registers.readByte(this.registers.C)
    }
  })

  this.instructionMap.set(0xF, {
    name: "RRCA",
    cycleTime: 4,
    operation: () => {
      this.registers.rotateRight()
    }
  })

  this.instructionMap.set(0x10, {
    name: "STOP 0",
    cycleTime: 4,
    operation: () => {
      this.isStopped = true
    }
  })

  this.instructionMap.set(0x11, {
    get name() {
      return `LD DE, 0x${memory.readWord(registers.PC.value).toString(16)}`
    },
    cycleTime: 12,
    operation: () => {
      this.registers.loadWord(this.registers.DE)
    }
  })

  this.instructionMap.set(0x12, {
    name: "LD (DE), A",
    cycleTime: 8,
    operation: () => {
      this.registers.writeToMemoryRegisterAddr(this.registers.DE, this.registers.A)
    }
  })

  this.instructionMap.set(0x13, {
    name: "INC DE",
    cycleTime: 8,
    operation: () => {
      this.registers.DE.value++
    }
  })

  this.instructionMap.set(0x14, {
    name: "INC D",
    cycleTime: 4,
    operation: () => {
      this.registers.increment(this.registers.D)
    }
  })

  this.instructionMap.set(0x15, {
    name: "DEC D",
    cycleTime: 4,
    operation: () => {
      this.registers.decrement(this.registers.D)
    }
  })

  this.instructionMap.set(0x16, {
    get name() {
      return `LD D, 0x${memory.readByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 8,
    operation: () => {
      this.registers.readByte(this.registers.D)
    }
  })

  this.instructionMap.set(0x17, {
    name: "RLA",
    cycleTime: 4,
    operation: () => {
      this.registers.rotateLeftCarry()
    }
  })

  this.instructionMap.set(0x18, {
    get name() {
      return `JR 0x${memory.readSignedByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 12,
    operation: () => {
      this.registers.relativeJump()
    }
  })

  this.instructionMap.set(0x19, {
    name: "ADD HL, DE",
    cycleTime: 8,
    operation: () => {
      this.registers.add16Bit(this.registers.HL, this.registers.DE)
    }
  })

  this.instructionMap.set(0x1A, {
    name: "LD A, (DE)",
    cycleTime: 8,
    operation: () => {
      this.registers.loadByte(this.registers.A, this.registers.DE)
    }
  })

  this.instructionMap.set(0x1B, {
    name: "DEC DE",
    cycleTime: 8,
    operation: () => {
      this.registers.DE.value--
    }
  })

  this.instructionMap.set(0x1C, {
    name: "INC E",
    cycleTime: 4,
    operation: () => {
      this.registers.increment(this.registers.E)
    }
  })

  this.instructionMap.set(0x1D, {
    name: "DEC E",
    cycleTime: 4,
    operation: () => {
      this.registers.decrement(this.registers.E)
    }
  })

  this.instructionMap.set(0x1E, {
    get name() {
      return `LD E, 0x${memory.readByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 8,
    operation: () => {
      this.registers.readByte(this.registers.E)
    }
  })

  this.instructionMap.set(0x1F, {
    name: "RRA",
    cycleTime: 4,
    operation: () => {
      this.registers.rotateRightCarry()
    }
  })

  this.instructionMap.set(0x20, {
    get name() {
      return `JR NZ, 0x${memory.readSignedByte(registers.PC.value).toString(16)}`
    },
    get cycleTime()  {
      return !registers.F.zero ? 12 : 8
    },
    operation: () => {
      this.registers.relativeJumpIfNotZero()
    },
  })

  this.instructionMap.set(0x21, {
    get name() {
      return `LD HL, 0x${memory.readWord(registers.PC.value).toString(16)}`
    },
    cycleTime: 12,
    operation: () => {
      this.registers.loadWord(this.registers.HL)
    }
  })

  this.instructionMap.set(0x22, {
    name: "LD (HL+), A",
    cycleTime: 8,
    operation: () => {
      this.registers.writeToMemoryRegisterAddrAndIncrementTarget(this.registers.HL, this.registers.A)
    }
  })

  this.instructionMap.set(0x23, {
    name: "INC HL",
    cycleTime: 8,
    operation: () => {
      this.registers.HL.value++
    }
  })

  this.instructionMap.set(0x24, {
    name: "INC H",
    cycleTime: 4,
    operation: () => {
      this.registers.increment(this.registers.H)
    }
  })

  this.instructionMap.set(0x25, {
    name: "DEC H",
    cycleTime: 4,
    operation: () => {
      this.registers.decrement(this.registers.H)
    }
  })

  this.instructionMap.set(0x26, {
    get name() {
      return `LD H, ${memory.readByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 8,
    operation: () => {
      this.registers.readByte(this.registers.H)
    }
  })

  this.instructionMap.set(0x27, {
    name: "DAA",
    cycleTime: 4,
    operation: () => {
      this.registers.decimalAdjustAccumulator()
    }
  })

  this.instructionMap.set(0x28, {
    get name() {
      return `JR Z, 0x${memory.readSignedByte(registers.PC.value).toString(16)}`
    },
    get cycleTime() {
      return registers.F.zero ? 12 : 8
    },
    operation: () => {
      this.registers.relativeJumpIfZero()
    }
  })

  this.instructionMap.set(0x29, {
    name: "ADD HL, HL",
    cycleTime: 8,
    operation: () => {
      this.registers.add16Bit(this.registers.HL, this.registers.HL)
    }
  })

  this.instructionMap.set(0x2A, {
    name: "LD A, (HL+)",
    cycleTime: 8,
    operation: () => {
      this.registers.loadByteAndIncrementSource(this.registers.A, this.registers.HL)
    }
  })

  this.instructionMap.set(0x2B, {
    name: "DEC HL",
    cycleTime: 8,
    operation: () => {
      this.registers.HL.value--
    }
  })

  this.instructionMap.set(0x2C, {
    name: "INC L",
    cycleTime: 4,
    operation: () => {
      this.registers.increment(this.registers.L)
    }
  })

  this.instructionMap.set(0x2D, {
    name: "DEC L",
    cycleTime: 4,
    operation: () => {
      this.registers.decrement(this.registers.L)
    }
  })

  this.instructionMap.set(0x2E, {
    get name() {
      return `LD L, 0x${memory.readByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 8,
    operation: () => {
      this.registers.readByte(this.registers.L)
    }
  })

  this.instructionMap.set(0x2F, {
    name: "CPL",
    cycleTime: 4,
    operation: () => {
      this.registers.complementAccumulator()
    }
  })

  this.instructionMap.set(0x30, {
    get name() {
      return `JR NC, 0x${memory.readSignedByte(registers.PC.value).toString(16)}`
    },
    get cycleTime() {
      return !registers.F.carry ? 12 : 8
    },
    operation: () => {
      this.registers.relativeJumpIfNotCarry()
    }
  })

  this.instructionMap.set(0x31, {
    get name() {
      return `LD SP, 0x${memory.readWord(registers.PC.value).toString(16)}`
    },
    cycleTime: 12,
    operation: () => {
      this.registers.loadWord(this.registers.SP)
    }
  })

  this.instructionMap.set(0x32, {
    name: "LD (HL-), A",
    cycleTime: 8,
    operation: () => {
      this.registers.writeToMemoryRegisterAddrAndDecrementTarget(this.registers.HL, this.registers.A)
    }
  })

  this.instructionMap.set(0x33, {
    name: "INC SP",
    cycleTime: 8,
    operation: () => {
      this.registers.SP.value++
    }
  })

  this.instructionMap.set(0x34, {
    name: "INC (HL)",
    cycleTime: 0,
    operation: () => {
      this.registers.incrementMemoryValAtRegisterAddr(this.registers.HL)
    }
  })

  this.instructionMap.set(0x35, {
    name: "DEC (HL)",
    cycleTime: 0,
    operation: () => {
       this.registers.decrementMemoryValAtRegisterAddr(this.registers.HL)
    }
  })

  this.instructionMap.set(0x36, {
    get name() {
      return `LD (HL), 0x${memory.readByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 0,
    operation: () => {
      this.registers.writeByteIntoRegisterAddress(this.registers.HL)
    }
  })

  this.instructionMap.set(0x37, {
    name: "SCF",
    cycleTime: 4,
    operation: () => {
      this.registers.setCarryFlag()
    }
  })

  this.instructionMap.set(0x38, {
    get name() {
      return `JR C, 0x${memory.readSignedByte(registers.PC.value).toString(16)}`
    },
    get cycleTime()  {
      return registers.F.carry ? 12 : 8
    },
    operation: () => {
      this.registers.relativeJumpIfCarry()
    }
  })

  this.instructionMap.set(0x39, {
    name: "ADD HL, SP",
    cycleTime: 8,
    operation: () => {
      this.registers.add16Bit(this.registers.HL, this.registers.SP)
    }
  })

  this.instructionMap.set(0x3A, {
    name: "LD A, (HL-)",
    cycleTime: 8,
    operation: () => {
      this.registers.loadByteAndDecrementSource(this.registers.A, this.registers.HL)
    }
  })

  this.instructionMap.set(0x3B, {
    name: "DEC SP",
    cycleTime: 8,
    operation: () => {
      this.registers.SP.value--
    }
  })

  this.instructionMap.set(0x3C, {
    name: "INC A",
    cycleTime: 4,
    operation: () => {
      this.registers.increment(this.registers.A)
    }
  })

  this.instructionMap.set(0x3D, {
    name: "DEC A",
    cycleTime: 4,
    operation: () => {
      this.registers.decrement(this.registers.A)
    }
  })

  this.instructionMap.set(0x3E, {
    get name() {
      return `LD A, 0x${memory.readByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 8,
    operation: () => {
      this.registers.readByte(this.registers.A)
    }
  })

  this.instructionMap.set(0x3F, {
    name: "CCF",
    cycleTime: 4,
    operation: () => {
      this.registers.complementCarryFlag()
    }
  })

  this.instructionMap.set(0x40, {
    name: "LD B, B",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.B, this.registers.B)
    }
  })

  this.instructionMap.set(0x41, {
    name: "LD B, C",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.B, this.registers.C)
    }
  })

  this.instructionMap.set(0x42, {
    name: "LD B, D",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.B, this.registers.D)
    }
  })

  this.instructionMap.set(0x43, {
    name: "LD B, E",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.B, this.registers.E)
    }
  })

  this.instructionMap.set(0x44, {
    name: "LD B, H",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.B, this.registers.H)
    }
  })

  this.instructionMap.set(0x45, {
    name: "LD B, L",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.B, this.registers.L)
    }
  })

  this.instructionMap.set(0x46, {
    name: "LD B, (HL)",
    cycleTime: 8,
    operation: () => {
      this.registers.loadByte(this.registers.B, this.registers.HL)
    }
  })

  this.instructionMap.set(0x47, {
    name: "LD B, A",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.B, this.registers.A)
    }
  })

  this.instructionMap.set(0x48, {
    name: "LD C, B",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.C, this.registers.B)
    }
  })

  this.instructionMap.set(0x49, {
    name: "LD C, C",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.C, this.registers.C)
    }
  })

  this.instructionMap.set(0x4A, {
    name: "LD C, D",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.C, this.registers.D)
    }
  })

  this.instructionMap.set(0x4B, {
    name: "LD C, E",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.C, this.registers.E)
    }
  })

  this.instructionMap.set(0x4C, {
    name: "LD C, H",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.C, this.registers.H)
    }
  })

  this.instructionMap.set(0x4D, {
    name: "LD C, L",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.C, this.registers.L)
    }
  })

  this.instructionMap.set(0x4E, {
    name: "LD C, (HL)",
    cycleTime: 8,
    operation: () => {
      this.registers.loadByte(this.registers.C, this.registers.HL)
    }
  })

  this.instructionMap.set(0x4F, {
    name: "LD C, A",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.C, this.registers.A)
    }
  })

  this.instructionMap.set(0x50, {
    name: "LD D, B",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.D, this.registers.B)
    }
  })

  this.instructionMap.set(0x51, {
    name: "LD D, C",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.D, this.registers.C)
    }
  })

  this.instructionMap.set(0x52, {
    name: "LD D, D",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.D, this.registers.D)
    }
  })

  this.instructionMap.set(0x53, {
    name: "LD D, E",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.D, this.registers.E)
    }
  })

  this.instructionMap.set(0x54, {
    name: "LD D, H",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.D, this.registers.H)
    }
  })

  this.instructionMap.set(0x55, {
    name: "LD D, L",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.D, this.registers.L)
    }
  })

  this.instructionMap.set(0x56, {
    name: "LD D, (HL)",
    cycleTime: 8,
    operation: () => {
      this.registers.loadByte(this.registers.D, this.registers.HL)
    }
  })

  this.instructionMap.set(0x57, {
    name: "LD D, A",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.D, this.registers.A)
    }
  })

  this.instructionMap.set(0x58, {
    name: "LD E, B",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.E, this.registers.B)
    }
  })

  this.instructionMap.set(0x59, {
    name: "LD E, C",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.E, this.registers.C)
    }
  })

  this.instructionMap.set(0x5A, {
    name: "LD E, D",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.E, this.registers.D)
    }
  })

  this.instructionMap.set(0x5B, {
    name: "E, E",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.E, this.registers.E)
    }
  })

  this.instructionMap.set(0x5C, {
    name: "LD E, H",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.E, this.registers.H)
    }
  })

  this.instructionMap.set(0x5D, {
    name: "LD E, L",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.E, this.registers.L)
    }
  })

  this.instructionMap.set(0x5E, {
    name: "LD E, (HL)",
    cycleTime: 8,
    operation: () => {
      this.registers.loadByte(this.registers.E, this.registers.HL)
    }
  })

  this.instructionMap.set(0x5F, {
    name: "LD E, A",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.E, this.registers.A)
    }
  })

  this.instructionMap.set(0x60, {
    name: "LD H, B",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.H, this.registers.B)
    }
  })

  this.instructionMap.set(0x61, {
    name: "LD H, C",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.H, this.registers.C)
    }
  })

  this.instructionMap.set(0x62, {
    name: "LD H, D",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.H, this.registers.D)
    }
  })

  this.instructionMap.set(0x63, {
    name: "LD H, E",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.H, this.registers.E)
    }
  })

  this.instructionMap.set(0x64, {
    name: "LD H, H",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.H, this.registers.H)
    }
  })

  this.instructionMap.set(0x65, {
    name: "LD H, L",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.H, this.registers.L)
    }
  })

  this.instructionMap.set(0x66, {
    name: "LD H, (HL)",
    cycleTime: 8,
    operation: () => {
      this.registers.loadByte(this.registers.H, this.registers.HL)
    }
  })

  this.instructionMap.set(0x67, {
    name: "LD H, A",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.H, this.registers.A)
    }
  })

  this.instructionMap.set(0x68, {
    name: "LD L, B",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.L, this.registers.B)
    }
  })

  this.instructionMap.set(0x69, {
    name: "LD L, C",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.L, this.registers.C)
    }
  })

  this.instructionMap.set(0x6A, {
    name: "LD L, D",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.L, this.registers.D)
    }
  })

  this.instructionMap.set(0x6B, {
    name: "LD L, E",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.L, this.registers.E)
    }
  })

  this.instructionMap.set(0x6C, {
    name: "LD L, H",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.L, this.registers.H)
    }
  })

  this.instructionMap.set(0x6D, {
    name: "LD L, L",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.L, this.registers.L)
    }
  })

  this.instructionMap.set(0x6E, {
    name: "LD L, (HL)",
    cycleTime: 8,
    operation: () => {
      this.registers.loadByte(this.registers.L, this.registers.HL)
    }
  })

  this.instructionMap.set(0x6F, {
    name: "LD L, A",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.L, this.registers.A)
    }
  })

  this.instructionMap.set(0x70, {
    name: "LD (HL), B",
    cycleTime: 8,
    operation: () => {
      this.registers.writeToMemoryRegisterAddr(this.registers.HL, this.registers.B)
    }
  })

  this.instructionMap.set(0x71, {
    name: "LD (HL) C",
    cycleTime: 8,
    operation: () => {
      this.registers.writeToMemoryRegisterAddr(this.registers.HL, this.registers.C)
    }
  })

  this.instructionMap.set(0x72, {
    name: "LD (HL), D",
    cycleTime: 8,
    operation: () => {
      this.registers.writeToMemoryRegisterAddr(this.registers.HL, this.registers.D)
    }
  })

  this.instructionMap.set(0x73, {
    name: "LD (HL), E",
    cycleTime: 8,
    operation: () => {
      this.registers.writeToMemoryRegisterAddr(this.registers.HL, this.registers.E)
    }
  })

  this.instructionMap.set(0x74, {
    name: "LD (HL), H",
    cycleTime: 8,
    operation: () => {
      this.registers.writeToMemoryRegisterAddr(this.registers.HL, this.registers.H)
    }
  })

  this.instructionMap.set(0x75, {
    name: "LD (HL), L",
    cycleTime: 8,
    operation: () => {
      this.registers.writeToMemoryRegisterAddr(this.registers.HL, this.registers.L)
    }
  })

  this.instructionMap.set(0x76, {
    name: "HALT",
    cycleTime: 4,
    operation: () => {
      this.isHalted = true
    }
  })

  this.instructionMap.set(0x77, {
    name: "LD (HL), A",
    cycleTime: 8,
    operation: () => {
      this.registers.writeToMemoryRegisterAddr(this.registers.HL, this.registers.A)
    }
  })

  this.instructionMap.set(0x78, {
    name: "LD A, B",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.A, this.registers.B)
    }
  })

  this.instructionMap.set(0x79, {
    name: "LD A, C",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.A, this.registers.C)
    }
  })

  this.instructionMap.set(0x7A, {
    name: "LD A, D",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.A, this.registers.D)
    }
  })

  this.instructionMap.set(0x7B, {
    name: "LD A, E",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.A, this.registers.E)
    }
  })

  this.instructionMap.set(0x7C, {
    name: "LD A, H",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.A, this.registers.H)
    }
  })

  this.instructionMap.set(0x7D, {
    name: "LD A, L",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.A, this.registers.L)
    }
  })

  this.instructionMap.set(0x7E, {
    name: "LD A, (HL)",
    cycleTime: 8,
    operation: () => {
      this.registers.loadByte(this.registers.A, this.registers.HL)
    }
  })

  this.instructionMap.set(0x7F, {
    name: "LD A, A",
    cycleTime: 4,
    operation: () => {
      this.registers.load(this.registers.A, this.registers.A)
    }
  })

  this.instructionMap.set(0x80, {
    name: "ADD A, B",
    cycleTime: 4,
    operation: () => {
      this.registers.add(this.registers.A, this.registers.B)
    }
  })

  this.instructionMap.set(0x81, {
    name: "ADD A, C",
    cycleTime: 4,
    operation: () => {
      this.registers.add(this.registers.A, this.registers.C)
    }
  })

  this.instructionMap.set(0x82, {
    name: "ADD A, D",
    cycleTime: 4,
    operation: () => {
      this.registers.add(this.registers.A, this.registers.D)
    }
  })

  this.instructionMap.set(0x83, {
    name: "ADD A, E",
    cycleTime: 4,
    operation: () => {
      this.registers.add(this.registers.A, this.registers.E)
    }
  })

  this.instructionMap.set(0x84, {
    name: "ADD A, H",
    cycleTime: 4,
    operation: () => {
      this.registers.add(this.registers.A, this.registers.H)
    }
  })

  this.instructionMap.set(0x85, {
    name: "ADD A, L",
    cycleTime: 4,
    operation: () => {
      this.registers.add(this.registers.A, this.registers.L)
    }
  })

  this.instructionMap.set(0x86, {
    name: "ADD A, (HL)",
    cycleTime: 8,
    operation: () => {
      this.registers.addFromRegisterAddr(this.registers.A, this.registers.HL)
    }
  })

  this.instructionMap.set(0x87, {
    name: "ADD A, A",
    cycleTime: 4,
    operation: () => {
      this.registers.add(this.registers.A, this.registers.A)
    }
  })

  this.instructionMap.set(0x88, {
    name: "ADC A, B",
    cycleTime: 4,
    operation: () => {
      this.registers.addWithCarry(this.registers.B)
    }
  })

  this.instructionMap.set(0x89, {
    name: "ADC A, C",
    cycleTime: 4,
    operation: () => {
      this.registers.addWithCarry(this.registers.C)
    }
  })

  this.instructionMap.set(0x8A, {
    name: "ADC A, D",
    cycleTime: 4,
    operation: () => {
      this.registers.addWithCarry(this.registers.D)
    }
  })

  this.instructionMap.set(0x8B, {
    name: "ADC A, E",
    cycleTime: 4,
    operation: () => {
      this.registers.addWithCarry(this.registers.E)
    }
  })

  this.instructionMap.set(0x8C, {
    name: "ADC A, H",
    cycleTime: 4,
    operation: () => {
      this.registers.addWithCarry(this.registers.H)
    }
  })

  this.instructionMap.set(0x8D, {
    name: "ADC A, L",
    cycleTime: 4,
    operation: () => {
      this.registers.addWithCarry(this.registers.L)
    }
  })

  this.instructionMap.set(0x8E, {
    name: "ADC A, (HL)",
    cycleTime: 8,
    operation: () => {
      this.registers.addWithCarryFromMemory(this.registers.HL)
    }
  })

  this.instructionMap.set(0x8F, {
    name: "ADC A, A",
    cycleTime: 4,
    operation: () => {
      this.registers.addWithCarry(this.registers.A)
    }
  })

  this.instructionMap.set(0x90, {
    name: "SUB B",
    cycleTime: 4,
    operation: () => {
      this.registers.subtract(this.registers.B)
    }
  })

  this.instructionMap.set(0x91, {
    name: "SUB C",
    cycleTime: 4,
    operation: () => {
      this.registers.subtract(this.registers.C)
    }
  })

  this.instructionMap.set(0x92, {
    name: "SUB D",
    cycleTime: 4,
    operation: () => {
      this.registers.subtract(this.registers.D)
    }
  })

  this.instructionMap.set(0x93, {
    name: "SUB E",
    cycleTime: 4,
    operation: () => {
      this.registers.subtract(this.registers.E)
    }
  })

  this.instructionMap.set(0x94, {
    name: "SUB H",
    cycleTime: 4,
    operation: () => {
      this.registers.subtract(this.registers.H)
    }
  })

  this.instructionMap.set(0x95, {
    name: "SUB L",
    cycleTime: 4,
    operation: () => {
      this.registers.subtract(this.registers.L)
    }
  })

  this.instructionMap.set(0x96, {
    name: "SUB (HL)",
    cycleTime: 8,
    operation: () => {
      this.registers.subtractFromMemory(this.registers.HL)
    }
  })

  this.instructionMap.set(0x97, {
    name: "SUB A",
    cycleTime: 4,
    operation: () => {
      this.registers.subtract(this.registers.A)
    }
  })

  this.instructionMap.set(0x98, {
    name: "SBC A, B",
    cycleTime: 4,
    operation: () => {
      this.registers.subtractWithCarry(this.registers.B)
    }
  })

  this.instructionMap.set(0x99, {
    name: "SBC A, C",
    cycleTime: 4,
    operation: () => {
      this.registers.subtractWithCarry(this.registers.C)
    }
  })

  this.instructionMap.set(0x9A, {
    name: "SBC A, D",
    cycleTime: 4,
    operation: () => {
      this.registers.subtractWithCarry(this.registers.D)
    }
  })

  this.instructionMap.set(0x9B, {
    name: "SBC A, E",
    cycleTime: 4,
    operation: () => {
      this.registers.subtractWithCarry(this.registers.E)
    }
  })

  this.instructionMap.set(0x9C, {
    name: "SBC A, H",
    cycleTime: 4,
    operation: () => {
      this.registers.subtractWithCarry(this.registers.H)
    }
  })

  this.instructionMap.set(0x9D, {
    name: "SBC A, L",
    cycleTime: 4,
    operation: () => {
      this.registers.subtractWithCarry(this.registers.L)
    }
  })

  this.instructionMap.set(0x9E, {
    name: "SBC A, (HL)",
    cycleTime: 8,
    operation: () => {
      this.registers.subtractWithCarryFromMemory(this.registers.HL)
    }
  })

  this.instructionMap.set(0x9F, {
    name: "SBC A, A",
    cycleTime: 4,
    operation: () => {
      this.registers.subtractWithCarry(this.registers.A)
    }
  })

  this.instructionMap.set(0xA0, {
    name: "AND B",
    cycleTime: 4,
    operation: () => {
      this.registers.and(this.registers.B)
    }
  })

  this.instructionMap.set(0xA1, {
    name: "AND C",
    cycleTime: 4,
    operation: () => {
      this.registers.and(this.registers.C)
    }
  })

  this.instructionMap.set(0xA2, {
    name: "AND D",
    cycleTime: 4,
    operation: () => {
      this.registers.and(this.registers.D)
    }
  })

  this.instructionMap.set(0xA3, {
    name: "AND E",
    cycleTime: 4,
    operation: () => {
      this.registers.and(this.registers.E)
    }
  })

  this.instructionMap.set(0xA4, {
    name: "AND H",
    cycleTime: 4,
    operation: () => {
      this.registers.and(this.registers.H)
    }
  })

  this.instructionMap.set(0xA5, {
    name: "AND L",
    cycleTime: 4,
    operation: () => {
      this.registers.and(this.registers.L)
    }
  })

  this.instructionMap.set(0xA6, {
    name: "AND (HL)",
    cycleTime: 8,
    operation: () => {
      this.registers.andFromMemory(this.registers.HL)
    }
  })

  this.instructionMap.set(0xA7, {
    name: "AND A",
    cycleTime: 4,
    operation: () => {
      this.registers.and(this.registers.A)
    }
  })

  this.instructionMap.set(0xA8, {
    name: "XOR B",
    cycleTime: 4,
    operation: () => {
      this.registers.xor(this.registers.B)
    }
  })

  this.instructionMap.set(0xA9, {
    name: "XOR C",
    cycleTime: 4,
    operation: () => {
      this.registers.xor(this.registers.C)
    }
  })

  this.instructionMap.set(0xAA, {
    name: "XOR D",
    cycleTime: 4,
    operation: () => {
      this.registers.xor(this.registers.D)
    }
  })

  this.instructionMap.set(0xAB, {
    name: "XOR E",
    cycleTime: 4,
    operation: () => {
      this.registers.xor(this.registers.E)
    }
  })

  this.instructionMap.set(0xAC, {
    name: "XOR H",
    cycleTime: 4,
    operation: () => {
      this.registers.xor(this.registers.H)
    }
  })

  this.instructionMap.set(0xAD, {
    name: "XOR L",
    cycleTime: 4,
    operation: () => {
      this.registers.xor(this.registers.L)
    }
  })

  this.instructionMap.set(0xAE, {
    name: "XOR (HL)",
    cycleTime: 8,
    operation: () => {
      this.registers.xorFromMemory(this.registers.HL)
    }
  })

  this.instructionMap.set(0xAF, {
    name: "XOR A",
    cycleTime: 4,
    operation: () => {
      this.registers.xor(this.registers.A)
    }
  })

  this.instructionMap.set(0xB0, {
    name: "OR B",
    cycleTime: 4,
    operation: () => {
      this.registers.or(this.registers.B)
    }
  })

  this.instructionMap.set(0xB1, {
    name: "OR C",
    cycleTime: 4,
    operation: () => {
      this.registers.or(this.registers.C)
    }
  })

  this.instructionMap.set(0xB2, {
    name: "OR D",
    cycleTime: 4,
    operation: () => {
      this.registers.or(this.registers.D)
    }
  })

  this.instructionMap.set(0xB3, {
    name: "OR E",
    cycleTime: 4,
    operation: () => {
      this.registers.or(this.registers.E)
    }
  })

  this.instructionMap.set(0xB4, {
    name: "OR H",
    cycleTime: 4,
    operation: () => {
      this.registers.or(this.registers.H)
    }
  })

  this.instructionMap.set(0xB5, {
    name: "OR L",
    cycleTime: 4,
    operation: () => {
      this.registers.or(this.registers.L)
    }
  })

  this.instructionMap.set(0xB6, {
    name: "OR (HL)",
    cycleTime: 8,
    operation: () => {
      this.registers.orFromMemory(this.registers.HL)
    }
  })

  this.instructionMap.set(0xB7, {
    name: "OR A",
    cycleTime: 4,
    operation: () => {
      this.registers.or(this.registers.A)
    }
  })

  this.instructionMap.set(0xB8, {
    name: "CP B",
    cycleTime: 4,
    operation: () => {
      this.registers.compare(this.registers.B)
    }
  })

  this.instructionMap.set(0xB9, {
    name: "CP C",
    cycleTime: 4,
    operation: () => {
      this.registers.compare(this.registers.C)
    }
  })

  this.instructionMap.set(0xBA, {
    name: "CP D",
    cycleTime: 4,
    operation: () => {
      this.registers.compare(this.registers.D)
    }
  })

  this.instructionMap.set(0xBB, {
    name: "CP E",
    cycleTime: 4,
    operation: () => {
      this.registers.compare(this.registers.E)
    }
  })

  this.instructionMap.set(0xBC, {
    name: "CP H",
    cycleTime: 4,
    operation: () => {
      this.registers.compare(this.registers.H)
    }
  })

  this.instructionMap.set(0xBD, {
    name: "CP L",
    cycleTime: 4,
    operation: () => {
      this.registers.compare(this.registers.L)
    }
  })

  this.instructionMap.set(0xBE, {
    name: "CP (HL)",
    cycleTime: 8,
    operation: () => {
      this.registers.compareFromRegisterAddr(this.registers.HL)
    }
  })

  this.instructionMap.set(0xBF, {
    name: "CP A",
    cycleTime: 4,
    operation: () => {
      this.registers.compare(this.registers.A)
    }
  })

  this.instructionMap.set(0xC0, {
    name: "RET NZ",
    get cycleTime()  {
      return !registers.F.zero ? 20 : 8
    },
    operation: () => {
      this.registers.returnFromFunctionIfNotZero()
    }
  })

  this.instructionMap.set(0xC1, {
    name: "POP BC",
    cycleTime: 12,
    operation: () => {
      this.registers.popToRegister(this.registers.BC)
    }
  })

  this.instructionMap.set(0xC2, {
    get name() {
      return `JP NZ, 0x${memory.readWord(registers.PC.value).toString(16)}`
    },
    get cycleTime()  {
      return !registers.F.zero ? 16 : 12
    },
    operation: () => {
      this.registers.jumpIfNotZero()
    }
  })

  this.instructionMap.set(0xC3, {
    get name() {
      return  `JP 0x${memory.readWord(registers.PC.value).toString(16)}`
    },
    cycleTime: 16,
    operation: () => {
      this.registers.jump()
    }
  })

  this.instructionMap.set(0xC4, {
    get name() {
      return `CALL NZ, 0x${memory.readWord(registers.PC.value).toString(16)}`
    },
    get cycleTime()  {
      return !registers.F.zero ? 24 : 12
    },
    operation: () => {
      this.registers.callFunctionIfNotZero()
    }
  })

  this.instructionMap.set(0xC5, {
    name: "PUSH BC",
    cycleTime: 16,
    operation: () => {
      this.registers.pushFromRegister(this.registers.BC)
    }
  })

  this.instructionMap.set(0xC6, {
    get name() {
      return `ADD A, 0x${memory.readByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 8,
    operation: () => {
      this.registers.addImmediate(this.registers.A)
    }
  })

  this.instructionMap.set(0xC7, {
    name: "RST 00H",
    cycleTime: 16,
    operation: () => {
      this.registers.restart(0)
    }
  })

  this.instructionMap.set(0xC8, {
    name: "RET Z",
    get cycleTime()  {
      return registers.F.zero ? 20 : 8
    },
    operation: () => {
      this.registers.returnFromFunctionIfZero()
    }
  })

  this.instructionMap.set(0xC9, {
    name: "RET",
    cycleTime: 16,
    operation: () => {
      this.registers.returnFromFunction()
    }
  })

  this.instructionMap.set(0xCA, {
    get name() {
      return `JP Z, 0x${memory.readWord(registers.PC.value).toString(16)}`
    },
    get cycleTime()  {
      return registers.F.zero ? 16 : 12
    },
    operation: () => {
      this.registers.jumpIfZero()
    }
  })

  this.instructionMap.set(0xCB, {
    name: "PREFIX CB",
    cycleTime: 0,
    operation: () => {

    }
  })

  this.instructionMap.set(0xCC, {
    get name() {
      return `CALL Z, 0x${memory.readWord(registers.PC.value).toString(16)}`
    },
    get cycleTime()  {
      return registers.F.zero ? 24 : 12
    },
    operation: () => {
      this.registers.callFunctionIfZero()
    }
  })

  this.instructionMap.set(0xCD, {
    get name() {
      return `CALL 0x${memory.readWord(registers.PC.value).toString(16)}`
    },
    cycleTime: 24,
    operation: () => {
      this.registers.callFunction()
    }
  })

  this.instructionMap.set(0XCE, {
    get name() {
      return `ADC A, 0x${memory.readByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 8,
    operation: () => {
      this.registers.addWithCarryImmediate()
    }
  })

  this.instructionMap.set(0xCF, {
    name: "RST 08H",
    cycleTime: 16,
    operation: () => {
      this.registers.restart(0x8)
    }
  })

  this.instructionMap.set(0xD0, {
    name: "RET NC",
    get cycleTime()  {
      return !registers.F.carry ? 20 : 8
    },
    operation: () => {
      this.registers.returnFromFunctionIfNotCarry()
    }
  })

  this.instructionMap.set(0xD1, {
    name: "POP DE",
    cycleTime: 12,
    operation: () => {
      this.registers.popToRegister(this.registers.DE)
    }
  })

  this.instructionMap.set(0xD2, {
    get name() {
      return `JP NC 0x${memory.readWord(registers.PC.value).toString(16)}`
    },
    get cycleTime()  {
      return !registers.F.carry ? 16 : 12
    },
    operation: () => {
      this.registers.jumpIfNotCarry()
    }
  })

  // 0xD3 has no instruction

  this.instructionMap.set(0xD4, {
    get name() {
      return `CALL NC, 0x${memory.readWord(registers.PC.value).toString(16)}`
    },
    get cycleTime()  {
      return !registers.F.carry ? 24 : 12
    },
    operation: () => {
      this.registers.callFunctionIfNotCarry()
    }
  })

  this.instructionMap.set(0xD5, {
    name: "PUSH DE",
    cycleTime: 16,
    operation: () => {
      this.registers.pushFromRegister(this.registers.DE)
    }
  })

  this.instructionMap.set(0xD6, {
    get name() {
      return `SUB 0x${memory.readByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 8,
    operation: () => {
      this.registers.subtractImmediate()
    }
  })

  this.instructionMap.set(0xD7, {
    name: "RST 10H",
    cycleTime: 16,
    operation: () => {
      this.registers.restart(0x10)
    }
  })

  this.instructionMap.set(0xD8, {
    name: "RET C",
    get cycleTime()  {
      return registers.F.carry ? 20 : 8
    },
    operation: () => {
      this.registers.returnFromFunctionIfCarry()
    }
  })

  this.instructionMap.set(0xD9, {
    name: "RETI",
    cycleTime: 16,
    operation: () => {
      this.registers.returnFromFunction()
      this.interruptMasterEnabled = true
    }
  })

  this.instructionMap.set(0xDA, {
    get name() {
      return `JP C, 0x${memory.readWord(registers.PC.value).toString(16)}`
    },
    get cycleTime()  {
      return registers.F.carry ? 16 : 12
    },
    operation: () => {
      this.registers.jumpIfCarry()
    }
  })

  // 0xDB has no instruction

  this.instructionMap.set(0xDC, {
    get name() {
      return `CALL C, 0x${memory.readWord(registers.PC.value).toString(16)}`
    },
    get cycleTime()  {
      return registers.F.carry ? 24 : 12
    },
    operation: () => {
      this.registers.callFunctionIfCarry()
    }
  })

  // 0xDD has no instruction

  this.instructionMap.set(0xDE, {
    get name() {
      return `SBC A, ${memory.readByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 8,
    operation: () => {
      this.registers.subtractWithCarryImmediate()
    }
  })

  this.instructionMap.set(0xDF, {
    name: "RST 18H",
    cycleTime: 16,
    operation: () => {
      this.registers.restart(0x18)
    }
  })

  this.instructionMap.set(0xE0, {
    get name() {
      return `LDH (0xff00 + 0x${memory.readByte(registers.PC.value).toString(16)}), A`
    },
    cycleTime: 0,
    operation: () => {
      this.registers.writeToMemory8Bit(this.registers.A)
    }
  })

  this.instructionMap.set(0xE1, {
    name: "POP HL",
    cycleTime: 12,
    operation: () => {
      this.registers.popToRegister(this.registers.HL)
    }
  })

  this.instructionMap.set(0xE2, {
    name: "LDH (C), A",
    cycleTime: 8,
    operation: () => {
      this.registers.writeToMemoryRegisterAddr8bit(this.registers.C, this.registers.A)
    }
  })

  // 0xE3 has no instruction
  // 0xE4 has no instruction

  this.instructionMap.set(0xE5, {
    name: "PUSH HL",
    cycleTime: 16,
    operation: () => {
      this.registers.pushFromRegister(this.registers.HL)
    }
  })

  this.instructionMap.set(0xE6, {
    get name() {
      return `AND 0x${memory.readByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 8,
    operation: () => {
      this.registers.andImmediate()
    }
  })

  this.instructionMap.set(0xE7, {
    name: "RST 20H",
    cycleTime: 16,
    operation: () => {
      this.registers.restart(0x20)
    }
  })

  this.instructionMap.set(0xE8, {
    get name() {
      return `ADD SP, 0x${memory.readSignedByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 16,
    operation: () => {
      this.registers.addImmediateSigned(this.registers.SP)
    }
  })

  this.instructionMap.set(0xE9, {
    name: "JP (HL)",
    cycleTime: 4,
    operation: () => {
      this.registers.jumpToRegisterAddr()
    }
  })

  this.instructionMap.set(0xEA, {
    get name() {
      return `LD (${memory.readWord(registers.PC.value).toString(16)}), A`
    },
    cycleTime: 0,
    operation: () => {
      this.registers.writeToMemory16bit(this.registers.A)
    }
  })

  // 0xEB has no instruction
  // 0xEC has no instruction
  // 0xED has no instruction

  this.instructionMap.set(0xEE, {
    get name() {
      return `XOR 0x${memory.readByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 8,
    operation: () => {
      this.registers.xorImmediate()
    }
  })

  this.instructionMap.set(0xEF, {
    name: "RST 28H",
    cycleTime: 16,
    operation: () => {
      this.registers.restart(0x28)
    }
  })

  this.instructionMap.set(0xF0, {
    get name() {
      return `LDH A, (0x${memory.readByte(registers.PC.value).toString(16)})`
    },
    cycleTime: 0,
    operation: () => {
      this.registers.loadFromBase(this.registers.A)
    }
  })

  this.instructionMap.set(0xF1, {
    name: "POP AF",
    cycleTime: 12,
    operation: () => {
      this.registers.popToRegister(this.registers.AF)
    }
  })

  this.instructionMap.set(0xF2, {
    name: "LD A, (C)",
    cycleTime: 8,
    operation: () => {
      this.registers.loadByte8Bit(this.registers.A, this.registers.C)
    }
  })

  this.instructionMap.set(0xF3, {
    name: "DI",
    cycleTime: 4,
    operation: () => {
      this.interruptMasterEnabled = false
    }
  })

  // 0xF4 has no instruction

  this.instructionMap.set(0xF5, {
    name: "PUSH AF",
    cycleTime: 16,
    operation: () => {
      this.registers.pushFromRegister(this.registers.AF)
    }
  })

  this.instructionMap.set(0xF6, {
    get name() {
      return `OR ${memory.readByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 8,
    operation: () => {
      this.registers.orImmediate()
    }
  })

  this.instructionMap.set(0xF7, {
    name: "RST 30H",
    cycleTime: 16,
    operation: () => {
      this.registers.restart(0x30)
    }
  })

  this.instructionMap.set(0xF8, {
    get name() {
      return `LD HL, SP + 0x${memory.readSignedByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 12,
    operation: () => {
      this.registers.loadHLStackPointer()
    }
  })

  this.instructionMap.set(0xF9, {
    name: "LD SP, HL",
    cycleTime: 8,
    operation: () => {
      this.registers.load(this.registers.SP, this.registers.HL)
    }
  })

  this.instructionMap.set(0xFA, {
    get name() {
      return `LD A, (0x${memory.readWord(registers.PC.value).toString(16)})`
    },
    cycleTime: 0,
    operation: () => {
      this.registers.loadFrom16bitAddr(this.registers.A)
    }
  })

  this.instructionMap.set(0xFB, {
    name: "EI",
    cycleTime: 4,
    operation: () => {
      this.interruptMasterEnabled = true
    }
  })

  // 0xFC has no instruction
  // 0xFD has no instruction
  this.instructionMap.set(0xFE, {
    get name() {
      return `CP 0x${memory.readByte(registers.PC.value).toString(16)}`
    },
    cycleTime: 8,
    operation: () => {
      this.registers.compareImmediate()
    }
  })

  this.instructionMap.set(0xFF, {
    name: "RST 38H",
    cycleTime: 16,
    operation: () => {
      this.registers.restart(0x38)
    }
  })
}