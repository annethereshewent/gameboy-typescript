import { CPURegisters } from "./CPURegisters"
import { Instruction } from "./Instruction"
import { Memory } from "./Memory"
import { setCbMap } from "./setCbMap"
import { setInstructionMap } from "./setInstructionMap"

export class CPU {
  memory: Memory
  registers: CPURegisters

  isStopped = false
  isHalted = false
  interruptMasterEnabled = true

  setInstructionMap = setInstructionMap
  setCbMap = setCbMap
  instructionMap: Map<Number, Instruction> = new Map()
  cbMap: Map<Number, Instruction> = new Map()

  constructor(memory: Memory) {
    this.registers = new CPURegisters(memory)
    this.memory = memory

    this.setInstructionMap()
    this.setCbMap()
  }

  loadCartridge(arrayBuffer: ArrayBuffer) {
    const gameDataView = new DataView(arrayBuffer)
    this.memory.loadCartridge(gameDataView)
    this.initialize()
  }

  initialize() {
    this.memory.reset()
    this.registers = new CPURegisters(this.memory)
  }

  step(): number {
    const instructionAddress = this.memory.readByte(this.registers.PC.value)

    const instruction = this.instructionMap.get(instructionAddress)
    if (instruction != null) {
      console.log(`found instruction ${instruction.name} with code 0x${instructionAddress.toString(16).toUpperCase()} at address 0x${this.registers.PC.value.toString(16).toUpperCase()}`)

      this.registers.PC.value++

      instruction.operation()

      return instruction.cycleTime
    } else {
      throw new Error(`invalid instruction code: 0x${instructionAddress.toString(16).toUpperCase()}`)
    }
  }
}