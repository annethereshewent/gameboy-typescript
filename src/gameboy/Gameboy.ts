import { CPU } from "./cpu/CPU";
import { Memory } from "./cpu/Memory";
import { GPU } from "./gpu/GPU";

const memory = new Memory()

export class Gameboy {

  cpu = new CPU(memory)
  gpu = new GPU(memory)

  loadCartridge(arrayBuffer: ArrayBuffer) {
    this.cpu.loadCartridge(arrayBuffer)
  }

  run() {
    // debug: run the first couple of instructions to see what happens
    for (let i = 0; i < 1024; i++) {
      this.cpu.step()
      this.gpu.step()
    }
  }
}