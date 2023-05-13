import { Memory } from "../Memory";
import { MemoryRegister } from "./MemoryRegister"

export class DividerRegister extends MemoryRegister {
  constructor(memory: Memory) {
    super(0xff04, memory)
  }

  set overrideValue(newVal: number) {
    this.memory.writeByte(this.address, newVal, 'DividerRegister', true)
  }
}
