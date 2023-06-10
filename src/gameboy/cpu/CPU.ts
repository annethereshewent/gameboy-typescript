import { Gameboy } from "../Gameboy"
import { APU } from "../apu/APU"
import { GPU } from "../gpu/GPU"
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

  private setInstructionMap = setInstructionMap
  private setCbMap = setCbMap
  instructionMap: Map<Number, Instruction> = new Map()
  cbMap: Map<Number, Instruction> = new Map()

  private counter = 0
  private timerCycles = 0

  isDoubleSpeed = false

  private gpu: GPU
  private apu: APU

  constructor(memory: Memory, gpu: GPU, apu: APU) {
    this.registers = new CPURegisters(memory, this)
    this.memory = memory
    this.gpu = gpu
    this.apu = apu

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

    while (this.timerCycles >= timerControlRegister.getClockFrequency()) {
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

  performCbInstruction() {
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

    return cbInstruction.cycleTime
  }

  tick() {
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

        let cycles = instruction.cycleTime

        if (instruction.name === "PREFIX CB") {
          this.performCbInstruction()
        }

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

  cycle(cycles: number) {
    this.updateTimers(cycles)
    this.gpu.tick(cycles)
    this.apu.tick(cycles)
  }

  step(): number {
    this.checkInterrupts()
    this.checkIfDoubleSpeed()

    if (this.isHalted) {
      this.cycle(4)

      return 4
    }

    const cycles = this.tick()

    if (cycles !== 0) {
      this.cycle(cycles)
    }

    return cycles
  }
}