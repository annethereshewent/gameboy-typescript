import { Memory } from "../../cpu/Memory";
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister";

export class Channel4ControlRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff23, memory)
  }

  get soundLengthEnable() {
    return this.getBit(6)
  }

  get restartTrigger() {
    return this.getBit(7)
  }
}