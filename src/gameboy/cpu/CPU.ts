import { CPURegisters } from "./CPURegisters"
import { Instruction } from "./Instruction"
import { Memory } from "./Memory"
import { setInstructionMap } from "./setInstructionMap"

export class CPU {
  memory = new Memory()
  registers = new CPURegisters(this.memory)

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

    const instruction = this.instructionMap.get(instructionAddress)
    if (instruction != null) {
      console.log(`found instruction ${instruction.name} with code 0x${instructionAddress.toString(16).toUpperCase()} at address 0x${this.registers.PC.value.toString(16).toUpperCase()}`)

      this.registers.PC.value++

      instruction.operation()
    } else {
      throw new Error(`invalid instruction code: 0x${instructionAddress.toString(16).toUpperCase()}`)
    }
  }
}