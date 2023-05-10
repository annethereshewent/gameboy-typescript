import { CPU } from "./cpu/CPU"
import { CPURegisters } from "./cpu/CPURegisters"
import { Memory } from "./cpu/Memory"
import { GPU } from "./gpu/GPU"

const memory = new Memory()

const MAX_FPS = 60
const INTERVAL = 1000 / MAX_FPS

enum GamepadButtons {
  A,
  B,
  X,
  Y,
  LB,
  RB,
  LT,
  RT,
  Select,
  Start,
  L3,
  R3,
  Up,
  Down,
  Left,
  Right
}

export class Gameboy {

  setRegisters?: (registers: CPURegisters) => void

  constructor(setRegisters?: (registerData: CPURegisters) => void) {
    this.setRegisters = setRegisters
  }

  static MAX_FRAMES_TO_RUN = 60 * 10

  cpu = new CPU(memory)
  gpu = new GPU(memory)

  fps = 0
  cycles = 0
  previousTime = 0
  static frames = 0


  // only output the last logs of execution.
  // otherwise, logs get polluted with too much data
  // to sift through
  static shouldOutputLogs() {
    // return this.frames >= this.MAX_FRAMES_TO_RUN - 5
    return false
  }

  loadCartridge(arrayBuffer: ArrayBuffer) {
    this.cpu.loadCartridge(arrayBuffer)
  }

  run() {
    const context = document.querySelector("canvas")?.getContext('2d')
    if (context != null) {
      requestAnimationFrame((time: number) => this.runFrame(time, context))
    } else {
      throw new Error("canvas context is null!")
    }
  }

  handleInput() {
    const { joypadRegister } = this.cpu.registers
    const gamepad = navigator.getGamepads()[0]

    if (gamepad != null) {
      if (joypadRegister.isPollingDirections) {

        if (gamepad.buttons[GamepadButtons.Left].pressed || gamepad.axes[0] < -0.2) {
          console.log("you're pressing left!")
          joypadRegister.isPressingLeft = true
        }
        if (gamepad.buttons[GamepadButtons.Right].pressed || gamepad.axes[0] > 0.2) {
          console.log("youre pressing right!")
          joypadRegister.isPressingRight = true
        }
        if (gamepad.buttons[GamepadButtons.Up].pressed || gamepad.axes[1] < -0.2) {
          console.log("you're pressing up!")
          joypadRegister.isPressingUp = true
        }
        if (gamepad.buttons[GamepadButtons.Down].pressed || gamepad.axes[1] > 0.2) {
          console.log("you're pressing down!")
          joypadRegister.isPressingDown = true
        }
      } else if (joypadRegister.isPollingActions) {
        if (gamepad.buttons[GamepadButtons.A].pressed) {
          console.log('youre pressing A!')
          joypadRegister.isPressingA = true
        }
        if (gamepad.buttons[GamepadButtons.B].pressed) {
          console.log("you're pressing B!")
          joypadRegister.isPressingB = true
        }
        if (gamepad.buttons[GamepadButtons.Select].pressed) {
          console.log("you're pressing Select!")
          joypadRegister.isPressingSelect = true
        }
        if (gamepad.buttons[GamepadButtons.Start].pressed) {
          console.log("you're pressing start!")
          joypadRegister.isPressingStart = true
        }
      }
    }
  }

  runFrame(currentTime: number, context: CanvasRenderingContext2D) {
    const diff = currentTime - this.previousTime

    let cycles = 0
    if (diff >= INTERVAL || this.previousTime === 0) {
      this.fps = 1000 / diff

      this.previousTime = currentTime - (diff % INTERVAL)

      while (this.cycles <= GPU.CyclesPerFrame) {
        cycles = this.cpu.step()
        if (cycles !== -1) {
          this.gpu.step(cycles)
          this.cycles += cycles
        } else {
          break
        }
      }

      this.handleInput()

      context.putImageData(this.gpu.screen, 0, 0)

      Gameboy.frames++

      this.cycles %= GPU.CyclesPerFrame
    }

    if (Gameboy.frames !== Gameboy.MAX_FRAMES_TO_RUN && cycles !== -1) {
      requestAnimationFrame((time: number) => this.runFrame(time, context))
    } else {
      // if (this.setRegisters != null) {
      //   this.setRegisters(this.cpu.registers)
      // }
      console.log(`finished running ${Gameboy.MAX_FRAMES_TO_RUN} frames successfully!`)

      const { registers } = this.cpu

      const registerPairs = [registers.AF, registers.BC, registers.DE, registers.HL, registers.SP, registers.PC]

      for (const registerPair of registerPairs) {
        console.log(`${registerPair.name}: ${registerPair.hexValue}`)
      }
    }
  }
}