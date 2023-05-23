import { CPU } from "../gameboy/cpu/CPU"
import { Memory } from "../gameboy/cpu/Memory"
import { GPU } from "../gameboy/gpu/GPU"

const memory = new Memory()
const gpu: GPU = jest.createMockFromModule("../gameboy/gpu/GPU")
const cpu = new CPU(memory, gpu)

const { registers } = cpu

test("it gets the correct cycle time", () => {
  // test CB and conditionals here
  registers.F.zero = false

  const instructions = [
    {
      index: 0x20,
      condition: () => registers.F.zero = false,
      cycleTime: 12
    },
    {
      index: 0x28,
      condition: () => registers.F.zero = true,
      cycleTime: 12
    },
    {
      index: 0x38,
      condition: () => registers.F.carry = true,
      cycleTime: 12
    },
    {
      index: 0xc0,
      condition: () => registers.F.zero = false,
      cycleTime: 20
    }
  ]

  for (const instructionToRun of instructions) {
    instructionToRun.condition()
    let instruction = cpu.instructionMap.get(instructionToRun.index)

    let cycleTime = instruction?.cycleTime

    expect(cycleTime).toBe(instructionToRun.cycleTime)
  }


})
