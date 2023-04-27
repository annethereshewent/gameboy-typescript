import { CPURegisters } from "./CPURegisters"
import { Instruction } from "./Instruction"
import { Memory } from "./Memory"
import { setInstructionMap } from "./setInstructionMap"

export class CPU {
  registers = new CPURegisters()
  memory = new Memory()

  setInstructionMap = setInstructionMap
  instructionMap: Map<Number, Instruction> = new Map()

  constructor() {
    this.setInstructionMap()
  }

  loadCartridge(arrayBuffer: ArrayBuffer) {
    const gameDataView = new DataView(arrayBuffer)
    this.memory.loadCartridge(gameDataView)
  }

  step() {
    const instructionAddress = this.memory.readByte(this.registers.PC.value)

    if (instructionAddress != null) {
      const instruction = this.instructionMap.get(instructionAddress);

      if (instruction != null) {
        instruction.operation()

        console.log(`found instruction ${instruction.name} with code ${instructionAddress.toString(16)} at address ${this.registers.PC.value.toString(16)}`
        );
      } else {
        console.warn(`invalid instruction code: ${instructionAddress.toString(16)}`)
      }

      this.registers.PC.value++;
    } else {
      throw new Error(`could not find instruction address at ${this.registers.PC.value}`)
    }
  }
}