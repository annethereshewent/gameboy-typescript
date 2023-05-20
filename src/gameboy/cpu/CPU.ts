import { logger } from "../../logging/Logger"
import { Gameboy } from "../Gameboy"
import { getBit } from "../misc/BitOperations"
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

  counter = 0
  timerCycles = 0

  isDoubleSpeed = false

  constructor(memory: Memory) {
    this.registers = new CPURegisters(memory)
    this.memory = memory

    this.setInstructionMap()
    this.setCbMap()
  }

  loadCartridge(arrayBuffer: ArrayBuffer) {
    const gameDataView = new DataView(arrayBuffer)
    const isGBC = this.memory.loadCartridge(gameDataView)
    this.initialize()

    return isGBC
  }

  initialize() {
    this.memory.reset()
    this.registers.initialize()
    Gameboy.frames = 0
  }

  updateTimers(cycles: number) {
    const {
      timerControlRegister,
      dividerRegister,
      timerCounterRegister,
      interruptRequestRegister,
      timerModuloRegister
    } = this.registers

    this.counter = (this.counter + cycles) & 0xffff

    const msb = (this.counter >> 8) & 0xff

    dividerRegister.overrideValue = msb

    if (!timerControlRegister.isTimerEnabled()) {
      return
    }

    this.timerCycles += cycles

    if (this.timerCycles >= timerControlRegister.getClockFrequency()) {
      this.timerCycles -= timerControlRegister.getClockFrequency()
      // if overflow happens
      if (timerCounterRegister.value === 0xff) {
        interruptRequestRegister.triggerTimerRequest()
        timerCounterRegister.value = timerModuloRegister.value
      } else {
        timerCounterRegister.value++
      }

    }

  }

  checkInterrupts() {
    const { interruptRequestRegister, interruptEnableRegister } = this.registers

    const hasInterrupts = interruptEnableRegister.value & interruptRequestRegister.value

    if (hasInterrupts > 0) {
      this.isHalted = false
    }

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

  checkIfDoubleSpeed() {
    const speedSwitch = this.memory.readByte(0xff4d)

    if (getBit(speedSwitch, 7) === 1) {
      this.isDoubleSpeed = true
    } else {
      this.isDoubleSpeed = false
    }
  }

  // TODO: refactor this
  step(): number {
    this.checkInterrupts()
    this.checkIfDoubleSpeed()

    if (this.isHalted) {
      this.updateTimers(4)

      return 4
    }

    try {
      const opCode = this.memory.readByte(this.registers.PC.value)

      const instruction = this.instructionMap.get(opCode)

      if (instruction != null) {
        const previousAddress = this.registers.PC.hexValue

        this.registers.PC.value++

        if (Gameboy.shouldOutputLogs) {
          console.log(`found instruction ${instruction.name} with code 0x${opCode.toString(16)} at address ${previousAddress}`)
        }

        instruction.operation()

        let cbCycles = null

        if (instruction.name === "PREFIX CB") {
          const cbOpCode = this.memory.readByte(this.registers.PC.value)
          const cbInstruction = this.cbMap.get(cbOpCode)

          if (cbInstruction == null) {
            throw new Error(`Invalid CB op code: 0x${cbOpCode.toString(16)}`)
          }
          const previousAddress = this.registers.PC.hexValue
          this.registers.PC.value++

          if (Gameboy.shouldOutputLogs) {
            console.log(`found instruction ${cbInstruction.name} with code 0x${cbOpCode.toString(16)} at address ${previousAddress}`)
          }

          cbInstruction.operation()

          cbCycles = cbInstruction.cycleTime
        }
        let cycles = 0
        if (cbCycles == null) {
          cycles = instruction.cycleTime
        } else {
          cycles = cbCycles
        }

        this.updateTimers(cycles)

        if (this.isDoubleSpeed) {
          cycles = cycles / 2
        }

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