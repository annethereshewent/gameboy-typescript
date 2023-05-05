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
      console.log('checking interrupts')
      if (interruptEnableRegister.isVBlankInterruptEnabled() && interruptRequestRegister.vBlankInterruptRequest()) {
        console.log(`vblank interrupt received!`)
        interruptRequestRegister.clearVBlankRequest()
        this.registers.PC.value = VBLANK_INTERRUPT_ADDRESS

        this.interruptMasterEnabled = false
      }
      else if (interruptEnableRegister.isLCDStatInterruptEnabled() && interruptRequestRegister.lcdStatInterruptRequest()) {
        console.log('lcd interrupt received!')
        interruptRequestRegister.clearLcdStatRequest()
        this.registers.PC.value = LCD_INTERRUPT_ADDRESS

        this.interruptMasterEnabled = false
      }
      else if (interruptEnableRegister.isTimerInterruptEnabled() && interruptRequestRegister.timerInterruptRequest()) {
        console.log('timer interrupt received!')
        interruptRequestRegister.clearTimerRequest()
        this.registers.PC.value = TIMER_INTERRUPT_ADDRESS

        this.interruptMasterEnabled = false
      }
      else if (interruptEnableRegister.isSerialInterruptEnabled() && interruptRequestRegister.serialInterruptRequest()) {
        console.log('serial interrupt received!')
        interruptRequestRegister.clearSerialRequest()
        this.registers.PC.value = SERIAL_INTERRUPT_ADDRESS

        this.interruptMasterEnabled = false
      }
      else if (interruptEnableRegister.isJoypadInterruptEnabled() && interruptRequestRegister.joypadInterruptRequest()) {
        console.log('joypad interrupt received!')
        interruptRequestRegister.clearJoypadRequest()
        this.registers.PC.value = JOYPAD_INTERRUPT_ADDRESS

        this.interruptMasterEnabled = false
      }
    }
  }

  step(): number {
    this.checkInterrupts()

    if (this.isHalted) {
      this.updateTimers(4)

      return 4
    }

    const instructionAddress = this.memory.readByte(this.registers.PC.value)

    const instruction = this.instructionMap.get(instructionAddress)
    if (instruction != null) {
      console.log(`found instruction ${instruction.name} with code 0x${instructionAddress.toString(16).toUpperCase()} at address 0x${this.registers.PC.value.toString(16).toUpperCase()}`)

      this.registers.PC.value++

      instruction.operation()

      this.updateTimers(instruction.cycleTime)

      return instruction.cycleTime
    } else {
      throw new Error(`invalid instruction code: 0x${instructionAddress.toString(16).toUpperCase()}`)
    }
  }
}