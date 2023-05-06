import { CPU } from "./cpu/CPU"
import { Memory } from "./cpu/Memory"
import { GPU } from "./gpu/GPU"

const memory = new Memory()

const MAX_FPS = 60
const INTERVAL = 1000 / MAX_FPS


const MAX_FRAMES_TO_RUN = 60 * 5

export class Gameboy {

  cpu = new CPU(memory)
  gpu = new GPU(memory)

  fps = 0
  cycles = 0
  previousTime = 0
  frames = 0


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

  runFrame(currentTime: number, context: CanvasRenderingContext2D) {
    const diff = currentTime - this.previousTime

    if (diff >= INTERVAL || this.previousTime === 0) {
      this.fps = 1000 / diff

      this.previousTime = currentTime - (diff % INTERVAL)

      while (this.cycles <= GPU.CyclesPerFrame) {
        const cycles = this.cpu.step(this.frames)
        this.gpu.step(cycles)

        this.cycles += cycles
      }

      context.putImageData(this.gpu.screen, 0, 0)

      this.frames++
    }

    if (this.frames !== MAX_FRAMES_TO_RUN) {
      requestAnimationFrame((time: number) => this.runFrame(time, context))
    } else {
      const data = new Blob([this.cpu.commands], {type: 'text/plain'})

      const textFile = URL.createObjectURL(data)

      console.log(`successfully saved commands to ${textFile}`)

      alert(`finished running ${MAX_FRAMES_TO_RUN} frames successfully!`)
    }

    this.cycles %= GPU.CyclesPerFrame
  }
}