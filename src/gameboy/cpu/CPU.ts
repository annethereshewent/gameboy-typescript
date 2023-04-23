import { CPURegisters } from "./CPURegisters"
import { Instruction } from "./Instruction"
import { setInstructionMap } from "./setInstructionMap"

export class CPU {
  registers = new CPURegisters()

  setInstructionMap = setInstructionMap
  instructionMap: Map<Number, Instruction> = new Map()

  constructor() {
    this.setInstructionMap()
  }
}