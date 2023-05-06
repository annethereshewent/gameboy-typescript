import { Memory } from "../Memory";
import { MemoryRegister } from "./MemoryRegister"

export class JoypadRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff00, memory)

    this.value = 0xff
  }
}