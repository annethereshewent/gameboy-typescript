import { Memory } from "../../cpu/Memory"
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"

export class BackgroundPaletteDataRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff68, memory, "BackgroundPaletteDataRegister")
  }
}