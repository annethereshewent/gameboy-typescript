import { CPU } from "./CPU"

export function setInstructionMap(this: CPU) {
  this.instructionMap.set(0x0, {
    name: "NOP",
    operation() {

    }
  })

  this.instructionMap.set(0x1, {
    name: "LD BC, d16",
    operation() {

    }
  })

  this.instructionMap.set(0x2, {
    name: "LD (BC), A",
    operation() {

    }
  })

  this.instructionMap.set(0x3, {
    name: "INC BC",
    operation: () => {
      this.registers.BC.value++
    }
  })

  this.instructionMap.set(0x4, {
    name: "INC B",
    operation: () => {
      this.registers.increment(this.registers.B)
    }
  })

  this.instructionMap.set(0x5, {
    name: "DEC B",
    operation: () => {
      this.registers.decrement(this.registers.B)
    }
  })

  this.instructionMap.set(0x6, {
    name: "LD B, d8",
    operation() {

    }
  })

  this.instructionMap.set(0x7, {
    name: "RLCA",
    operation: () => {

    }
  })

  this.instructionMap.set(0x8, {
    name: "LD (a16), SP",
    operation: () => {}
  })

  this.instructionMap.set(0x9, {
    name: "ADD HL, BC",
    operation: () => {
      this.registers.add16Bit(this.registers.HL, this.registers.BC)
    }
  })

  this.instructionMap.set(0xA, {
    name: "LD A, (BC)",
    operation: () => {

    }
  })

  this.instructionMap.set(0xB, {
    name: "DEC BC",
    operation: () => {
      this.registers.BC.value--
    }
  })

  this.instructionMap.set(0xC, {
    name: "INC C",
    operation: () => {
      this.registers.increment(this.registers.C)
    }
  })

  this.instructionMap.set(0xD, {
    name: "DEC C",
    operation: () => {
      this.registers.decrement(this.registers.C)
    }
  })

  this.instructionMap.set(0xE, {
    name: "LD C, d8",
    operation: () => {

    }
  })

  this.instructionMap.set(0xF, {
    name: "RRCA",
    operation: () => {

    }
  })

  this.instructionMap.set(0x10, {
    name: "STOP 0",
    operation: () => {

    }
  })

  this.instructionMap.set(0x11, {
    name: "LD DE, d16",
    operation: () => {

    }
  })

  this.instructionMap.set(0x12, {
    name: "LD (DE), A",
    operation: () => {

    }
  })

  this.instructionMap.set(0x13, {
    name: "INC DE",
    operation: () => {
      this.registers.DE.value++
    }
  })

  this.instructionMap.set(0x14, {
    name: "INC H",
    operation: () => {
      this.registers.increment(this.registers.H)
    }
  })

  this.instructionMap.set(0x15, {
    name: "DEC D",
    operation: () => {
      this.registers.decrement(this.registers.D)
    }
  })

  this.instructionMap.set(0x16, {
    name: "LD D, d8",
    operation: () => {

    }
  })

  this.instructionMap.set(0x17, {
    name: "RLA",
    operation: () => {

    }
  })

  this.instructionMap.set(0x18, {
    name: "JR r8",
    operation: () => {

    }
  })

  this.instructionMap.set(0x19, {
    name: "ADD HL, DE",
    operation: () => {
      this.registers.add16Bit(this.registers.HL, this.registers.DE)
    }
  })

  this.instructionMap.set(0x1A, {
    name: "LD A, (DE)",
    operation: () => {

    }
  })

  this.instructionMap.set(0x1B, {
    name: "DEC DE",
    operation: () => {
      this.registers.DE.value--
    }
  })

  this.instructionMap.set(0x1C, {
    name: "INC E",
    operation: () => {
      this.registers.increment(this.registers.E)
    }
  })

  this.instructionMap.set(0x1D, {
    name: "DEC E",
    operation: () => {
      this.registers.decrement(this.registers.E)
    }
  })

  this.instructionMap.set(0x1E, {
    name: "LD E, d8",
    operation: () => {

    }
  })

  this.instructionMap.set(0x1F, {
    name: "RRA",
    operation: () => {

    }
  })

  this.instructionMap.set(0x20, {
    name: "JR NZ, r8",
    operation: () => {

    }
  })

  this.instructionMap.set(0x21, {
    name: "LD HL, d16",
    operation: () => {

    }
  })

  this.instructionMap.set(0x22, {
    name: "LD (HL+), A",
    operation: () => {

    }
  })

  this.instructionMap.set(0x23, {
    name: "INC HL",
    operation: () => {
      this.registers.HL.value++
    }
  })

  this.instructionMap.set(0x24, {
    name: "INC H",
    operation: () => {
      this.registers.increment(this.registers.H)
    }
  })

  this.instructionMap.set(0x25, {
    name: "DEC H",
    operation: () => {
      this.registers.decrement(this.registers.H)
    }
  })

  this.instructionMap.set(0x26, {
    name: "LD H, d8",
    operation: () => {

    }
  })

  this.instructionMap.set(0x27, {
    name: "DAA",
    operation: () => {

    }
  })

  this.instructionMap.set(0x28, {
    name: "JR Z, r8",
    operation: () => {

    }
  })

  this.instructionMap.set(0x29, {
    name: "ADD HL, HL",
    operation: () => {
      this.registers.add16Bit(this.registers.HL, this.registers.HL)
    }
  })

  this.instructionMap.set(0x2A, {
    name: "LD A, (HL+)",
    operation: () => {

    }
  })

  this.instructionMap.set(0x2B, {
    name: "DEC HL",
    operation: () => {
      this.registers.HL.value--
    }
  })

  this.instructionMap.set(0x2C, {
    name: "INC L",
    operation: () => {
      this.registers.increment(this.registers.L)
    }
  })

  this.instructionMap.set(0x2D, {
    name: "DEC L",
    operation: () => {
      this.registers.decrement(this.registers.L)
    }
  })

  this.instructionMap.set(0x2E, {
    name: "LD L, d8",
    operation: () => {

    }
  })

  this.instructionMap.set(0x2F, {
    name: "CPL",
    operation: () => {

    }
  })

  this.instructionMap.set(0x30, {
    name: "JR NC, r8",
    operation: () => {

    }
  })

  this.instructionMap.set(0x31, {
    name: "LD SP, d16",
    operation: () => {

    }
  })

  this.instructionMap.set(0x32, {
    name: "",
    operation: () => {

    }
  })

  this.instructionMap.set(0x33, {
    name: "INC SP",
    operation: () => {
      this.registers.SP.value++
    }
  })

  this.instructionMap.set(0x34, {
    name: "INC (HL)",
    operation: () => {

    }
  })

  this.instructionMap.set(0x35, {
    name: "DEC (HL)",
    operation: () => {

    }
  })

  this.instructionMap.set(0x36, {
    name: "LD (HL), d8",
    operation: () => {

    }
  })

  this.instructionMap.set(0x37, {
    name: "SCF",
    operation: () => {

    }
  })

  this.instructionMap.set(0x38, {
    name: "JR C, r8",
    operation: () => {

    }
  })

  this.instructionMap.set(0x39, {
    name: "ADD HL, SP",
    operation: () => {
      this.registers.add16Bit(this.registers.HL, this.registers.SP)
    }
  })

  this.instructionMap.set(0x3A, {
    name: "LD A, (HL-)",
    operation: () => {

    }
  })

  this.instructionMap.set(0x3B, {
    name: "DEC SP",
    operation: () => {
      this.registers.SP.value--
    }
  })

  this.instructionMap.set(0x3C, {
    name: "INC A",
    operation: () => {
      this.registers.increment(this.registers.A)
    }
  })

  this.instructionMap.set(0x3D, {
    name: "DEC A",
    operation: () => {
      this.registers.decrement(this.registers.A)
    }
  })

  this.instructionMap.set(0x3E, {
    name: "LD A, d8",
    operation: () => {

    }
  })

  this.instructionMap.set(0x3F, {
    name: "CCF",
    operation: () => {

    }
  })


}