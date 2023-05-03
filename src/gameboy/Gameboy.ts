import { CPU } from "./cpu/CPU";
import { Memory } from "./cpu/Memory";
import { GPU } from "./gpu/GPU";

const memory = new Memory()

const MAX_FPS = 60
const INTERVAL = 1000 / MAX_FPS

export class Gameboy {

  cpu = new CPU(memory)
  gpu = new GPU(memory)

  fps = 0
  cycles = 0
  previousTime = 0
  iterations = 0

  context = document.querySelector("canvas")?.getContext('2d')

  loadCartridge(arrayBuffer: ArrayBuffer) {
    this.cpu.loadCartridge(arrayBuffer)
  }

  run() {
    // debug: run the first couple of instructions to see what happens
    if (this.iterations !== 10) {
      requestAnimationFrame((time: number) => this.runFrame(time))
    }
  }

  runFrame(currentTime: number) {
    const diff = currentTime - this.previousTime

    if (diff >= INTERVAL || this.previousTime === 0) {
      this.fps = 1000 / diff

      this.previousTime = currentTime - (diff % INTERVAL)

      while (this.cycles <= GPU.CyclesPerFrame) {
        const cycles = this.cpu.step()
        this.gpu.step()

        this.cycles += cycles
      }

      this.context?.putImageData(this.gpu.screen, 0, 0)

      this.cycles %= GPU.CyclesPerFrame
      this.iterations++
    }
  }
}