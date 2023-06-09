import { APU } from "./apu/APU"
import { CPU } from "./cpu/CPU"
import { Memory } from "./cpu/Memory"
import { GPU } from "./gpu/GPU"
import { Joypad } from "./joypad/Joypad"

const memory = new Memory()

const MAX_FPS = 60
const INTERVAL = 1000 / MAX_FPS

export class Gameboy {

  gpu = new GPU(memory)
  cpu = new CPU(memory, this.gpu, new APU(memory))


  fps = 0
  cycles = 0
  previousTime = 0
  static frames = 0

  static shouldOutputLogs = false

  isRunning = true

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


  execute(currentTime: number, context: CanvasRenderingContext2D) {

    const diff = currentTime - this.previousTime

    if (diff >= INTERVAL || this.previousTime === 0) {
      this.fps = 1000 / diff

      this.previousTime = currentTime - (diff % INTERVAL)

      while (this.cycles <= GPU.CyclesPerFrame) {
        this.cycles += this.cpu.step()
      }

      Joypad.handleInput()

      context.putImageData(this.gpu.screen, 0, 0)

      Gameboy.frames++

      this.cycles %= GPU.CyclesPerFrame
    }

    if (this.isRunning) {
      requestAnimationFrame((time: number) => this.execute(time, context))
    }
  }
}