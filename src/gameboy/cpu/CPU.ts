import { CPURegisters } from "./CPURegisters"
import { CbInstruction, Instruction } from "./Instruction"
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

  commands: string = ""

  setInstructionMap = setInstructionMap
  setCbMap = setCbMap
  instructionMap: Map<Number, Instruction> = new Map()
  cbMap: Map<Number, CbInstruction> = new Map()

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
      console.log(`checking interrupts`)
      if (interruptEnableRegister.isVBlankInterruptEnabled() && interruptRequestRegister.vBlankInterruptRequest()) {
        console.log('received vblank interrupt')
        interruptRequestRegister.clearVBlankRequest()
        this.registers.PC.value = VBLANK_INTERRUPT_ADDRESS

        this.interruptMasterEnabled = false
      }
      else if (interruptEnableRegister.isLCDStatInterruptEnabled() && interruptRequestRegister.lcdStatInterruptRequest()) {
        console.log('received lcd stat interrupt')
        interruptRequestRegister.clearLcdStatRequest()
        this.registers.PC.value = LCD_INTERRUPT_ADDRESS

        this.interruptMasterEnabled = false
      }
      else if (interruptEnableRegister.isTimerInterruptEnabled() && interruptRequestRegister.timerInterruptRequest()) {
        console.log('received timer interrupt')
        interruptRequestRegister.clearTimerRequest()
        this.registers.PC.value = TIMER_INTERRUPT_ADDRESS

        this.interruptMasterEnabled = false
      }
      else if (interruptEnableRegister.isSerialInterruptEnabled() && interruptRequestRegister.serialInterruptRequest()) {
        console.log('received serial interrupt')
        interruptRequestRegister.clearSerialRequest()
        this.registers.PC.value = SERIAL_INTERRUPT_ADDRESS

        this.interruptMasterEnabled = false
      }
      else if (interruptEnableRegister.isJoypadInterruptEnabled() && interruptRequestRegister.joypadInterruptRequest()) {
        console.log('received joypad interrupt')
        interruptRequestRegister.clearJoypadRequest()
        this.registers.PC.value = JOYPAD_INTERRUPT_ADDRESS

        this.interruptMasterEnabled = false
      }
    }
  }

  logToFile() {

  }

  step(currentFrame: number): number {
    this.checkInterrupts()

    if (this.isHalted) {
      this.updateTimers(1)

      return 1
    }

    const opCode = this.memory.readByte(this.registers.PC.value)

    const instruction = this.instructionMap.get(opCode)
    if (instruction != null) {

      // console.log(`found instruction ${instruction.name} with code 0x${opCode.toString(16).toUpperCase()} at address 0x${this.registers.PC.value.toString(16).toUpperCase()}`)

      // if (instruction.name.indexOf("LD A") !== -1 || instruction.name.indexOf("LDH A") !== -1) {
      //  console.log(`just received instruction to load into A. register A's value is now ${this.registers.A.value}`)
      // }

      this.registers.PC.value++

      instruction.operation()

      let cbCycles = null

      if (instruction.name === "PREFIX CB") {
        const cbOpCode = this.memory.readByte(this.registers.PC.value)
        const cbInstruction = this.cbMap.get(cbOpCode)

        this.registers.PC.value++

        if (cbInstruction == null) {
          throw new Error(`CB operation not implemented yet: 0x${cbOpCode.toString(16)}`)
        }

        cbCycles = cbInstruction.operation()
      }

      const cycles = (cbCycles != null ? cbCycles : instruction.cycleTime) / 4

      this.updateTimers(cycles)

      return cycles
    } else {
      throw new Error(`invalid instruction code: 0x${opCode.toString(16).toUpperCase()}`)
    }
  }
}