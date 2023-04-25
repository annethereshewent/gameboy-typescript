import { CPU } from "./CPU"

export function setInstructionMap(this: CPU) {
  this.instructionMap.set(0x0, {
    name: "NOP",
    cycleTime: 4,
    operation() {

    }
  })

  this.instructionMap.set(0x1, {
    name: "LD BC, d16",
    cycleTime: 12,
    operation() {

    }
  })

  this.instructionMap.set(0x2, {
    name: "LD (BC), A",
    cycleTime: 8,
    operation() {

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
    name: "LD B, d8",
    cycleTime: 8,
    operation() {

    }
  })

  this.instructionMap.set(0x7, {
    name: "RLCA",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x8, {
    name: "LD (a16), SP",
    cycleTime: 20,
    operation: () => {}
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
    name: "LD C, d8",
    cycleTime: 8,
    operation: () => {

    }
  })

  this.instructionMap.set(0xF, {
    name: "RRCA",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x10, {
    name: "STOP 0",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x11, {
    name: "LD DE, d16",
    cycleTime: 12,
    operation: () => {

    }
  })

  this.instructionMap.set(0x12, {
    name: "LD (DE), A",
    cycleTime: 8,
    operation: () => {

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
      this.registers.increment(this.registers.H)
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
    name: "LD D, d8",
    cycleTime: 8,
    operation: () => {

    }
  })

  this.instructionMap.set(0x17, {
    name: "RLA",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x18, {
    name: "JR r8",
    cycleTime: 12,
    operation: () => {

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
    name: "LD E, d8",
    cycleTime: 8,
    operation: () => {

    }
  })

  this.instructionMap.set(0x1F, {
    name: "RRA",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x20, {
    name: "JR NZ, r8",
    cycleTime: !this.registers.F.carry ? 12 : 8,
    operation: () => {},
  });

  this.instructionMap.set(0x21, {
    name: "LD HL, d16",
    cycleTime: 12,
    operation: () => {

    }
  })

  this.instructionMap.set(0x22, {
    name: "LD (HL+), A",
    cycleTime: 8,
    operation: () => {

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
    name: "LD H, d8",
    cycleTime: 8,
    operation: () => {

    }
  })

  this.instructionMap.set(0x27, {
    name: "DAA",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x28, {
    name: "JR Z, r8",
    cycleTime: this.registers.F.zero ? 12 : 8,
    operation: () => {

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
    name: "LD L, d8",
    cycleTime: 8,
    operation: () => {

    }
  })

  this.instructionMap.set(0x2F, {
    name: "CPL",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x30, {
    name: "JR NC, r8",
    cycleTime: this.registers.F.carry ? 8 : 12,
    operation: () => {

    }
  })

  this.instructionMap.set(0x31, {
    name: "LD SP, d16",
    cycleTime: 12,
    operation: () => {

    }
  })

  this.instructionMap.set(0x32, {
    name: "(HL-), A",
    cycleTime: 8,
    operation: () => {

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
    cycleTime: 12,
    operation: () => {

    }
  })

  this.instructionMap.set(0x35, {
    name: "DEC (HL)",
    cycleTime: 12,
    operation: () => {

    }
  })

  this.instructionMap.set(0x36, {
    name: "LD (HL), d8",
    cycleTime: 12,
    operation: () => {

    }
  })

  this.instructionMap.set(0x37, {
    name: "SCF",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x38, {
    name: "JR C, r8",
    cycleTime: this.registers.F.carry ? 12 : 8,
    operation: () => {

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
    name: "LD A, d8",
    cycleTime: 8,
    operation: () => {

    }
  })

  this.instructionMap.set(0x3F, {
    name: "CCF",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x40, {
    name: "LD B, B",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x41, {
    name: "LD B, C",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x42, {
    name: "LD B, D",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x43, {
    name: "LD B, E",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x44, {
    name: "LD B, H",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x45, {
    name: "LD B, L",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x46, {
    name: "LD B, (HL)",
    cycleTime: 8,
    operation: () => {

    }
  })

  this.instructionMap.set(0x47, {
    name: "LD B, A",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x48, {
    name: "LD C, B",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x49, {
    name: "LD C, C",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x4A, {
    name: "LD C, D",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x4B, {
    name: "LD C, E",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x4C, {
    name: "LD C, H",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x4D, {
    name: "LD C, L",
    cycleTime: 4,
    operation: () => {

    }
  })

  this.instructionMap.set(0x4E, {
    name: "LD C, (HL)",
    cycleTime: 8,
    operation: () => {

    }
  })

  this.instructionMap.set(0x4F, {
    name: "LD C, A",
    cycleTime: 4,
    operation: () => {

    }
  })
}