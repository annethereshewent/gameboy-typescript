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
}