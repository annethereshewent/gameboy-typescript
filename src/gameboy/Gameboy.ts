import { CPU } from "./cpu/CPU"
import { Memory } from "./cpu/Memory"
import { GPU } from "./gpu/GPU"
import { Joypad } from "./joypad/Joypad"

const memory = new Memory()

const MAX_FPS = 60
const INTERVAL = 1000 / MAX_FPS

export class Gameboy {

  cpu = new CPU(memory)
  gpu = new GPU(memory)

  fps = 0
  cycles = 0
  previousTime = 0
  static frames = 0

  static shouldOutputLogs = false

  loadCartridge(arrayBuffer: ArrayBuffer) {
    const isGBC = this.cpu.loadCartridge(arrayBuffer)

    this.gpu.isGBC = isGBC
  }

  run() {
    const context = document.querySelector("canvas")?.getContext('2d')
    if (context != null) {
      requestAnimationFrame((time: number) => this.execute(time, context))
    } else {
      throw new Error("canvas context is null!")
    }
  }

  outputLogs() {
    Gameboy.shouldOutputLogs = true
  }

  execute(currentTime: number, context: CanvasRenderingContext2D) {
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

      Joypad.handleInput()

      context.putImageData(this.gpu.screen, 0, 0)

      Gameboy.frames++

      this.cycles %= GPU.CyclesPerFrame
    }

    // if (Gameboy.frames !== MAX_FRAMES_TO_RUN && cycles !== -1) {
    requestAnimationFrame((time: number) => this.execute(time, context))
    // } else {
    //   console.log(`finished running ${Gameboy.frames} frames successfully!`)
    //   this.cpu.registers.outputState()
    //   logger.outputFile()
    // }
  }
}