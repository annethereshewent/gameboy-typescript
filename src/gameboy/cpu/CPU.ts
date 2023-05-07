import { Gameboy } from "../Gameboy"
import { CPURegisters } from "./CPURegisters"
import { Instruction } from "./Instruction"
import { Memory } from "./Memory"
import { setCbMap } from "./setCbMap"
import { setInstructionMap } from "./setInstructionMap"

// see https://gbdev.gg8.se/wiki/articles/Interrupts
const VBLANK_INTERRUPT_ADDRESS = 0x40
const LCD_INTERRUPT_ADDRESS = 0x48
const TIMER_INTERRUPT_ADDRESS = 0x50
const SERIAL_INTERRUPT_ADDRESS = 0x58
const JOYPAD_INTERRUPT_ADDRESS = 0x60

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

  updateTimers(cycles: number) {

  }

  checkInterrupts() {
    const { interruptRequestRegister, interruptEnableRegister } = this.registers

    if (this.interruptMasterEnabled) {
      if (interruptEnableRegister.isVBlankInterruptEnabled() && interruptRequestRegister.vBlankInterruptRequest()) {
        interruptRequestRegister.clearVBlankRequest()
        this.registers.pushToStack(this.registers.PC.value)
        this.registers.PC.value = VBLANK_INTERRUPT_ADDRESS

        this.interruptMasterEnabled = false
      }
      else if (interruptEnableRegister.isLCDStatInterruptEnabled() && interruptRequestRegister.lcdStatInterruptRequest()) {
        this.registers.pushToStack(this.registers.PC.value)
        interruptRequestRegister.clearLcdStatRequest()
        this.registers.PC.value = LCD_INTERRUPT_ADDRESS

        this.interruptMasterEnabled = false
      }
      else if (interruptEnableRegister.isTimerInterruptEnabled() && interruptRequestRegister.timerInterruptRequest()) {
        this.registers.pushToStack(this.registers.PC.value)
        interruptRequestRegister.clearTimerRequest()

        this.registers.PC.value = TIMER_INTERRUPT_ADDRESS

        this.interruptMasterEnabled = false
      }
      else if (interruptEnableRegister.isSerialInterruptEnabled() && interruptRequestRegister.serialInterruptRequest()) {
        this.registers.pushToStack(this.registers.PC.value)
        interruptRequestRegister.clearSerialRequest()
        this.registers.PC.value = SERIAL_INTERRUPT_ADDRESS

        this.interruptMasterEnabled = false
      }
      else if (interruptEnableRegister.isJoypadInterruptEnabled() && interruptRequestRegister.joypadInterruptRequest()) {
        this.registers.pushToStack(this.registers.PC.value)
        interruptRequestRegister.clearJoypadRequest()
        this.registers.PC.value = JOYPAD_INTERRUPT_ADDRESS

        this.interruptMasterEnabled = false
      }
    }
  }

  step(): number {
    this.checkInterrupts()

    if (this.isHalted) {
      this.updateTimers(1)

      return 1
    }

    try {

      const opCode = this.memory.readByte(this.registers.PC.value)

      const instruction = this.instructionMap.get(opCode)
      if (instruction != null) {
        if (Gameboy.frames >= Gameboy.MAX_FRAMES_TO_RUN - 2) {
          console.log(`found instruction ${instruction.name} with code 0x${opCode.toString(16)} at address ${this.registers.PC.hexValue}`)
        }

        this.registers.PC.value++

        instruction.operation()

        let cbCycles = null

        if (instruction.name === "PREFIX CB") {
          const cbOpCode = this.memory.readByte(this.registers.PC.value)
          const cbInstruction = this.cbMap.get(cbOpCode)

          if (cbInstruction == null) {
            throw new Error(`CB operation not implemented yet: 0x${cbOpCode.toString(16)}`)
          }

          // console.log(`found instruction ${cbInstruction.name} with code 0x${cbOpCode.toString(16)} at address ${this.registers.PC.hexValue}`)

          this.registers.PC.value++

          cbCycles = cbInstruction.cycleTime
        }

        const cycles = (cbCycles != null ? cbCycles : instruction.cycleTime) / 4

        this.updateTimers(cycles)

        return cycles
      } else {
        throw new Error(`invalid instruction code: 0x${opCode.toString(16).toUpperCase()}`)
      }
    } catch (e) {
      console.log(`execution failed at frame ${Gameboy.frames}`)
      throw e
    }
  }
}