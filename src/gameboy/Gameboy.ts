import { CPU } from "./cpu/CPU";

export class Gameboy {
  cpu: CPU = new CPU()

  loadCartridge(arrayBuffer: ArrayBuffer) {
    this.cpu.loadCartridge(arrayBuffer)
  }
}