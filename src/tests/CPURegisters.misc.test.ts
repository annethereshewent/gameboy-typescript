import { APU } from "../gameboy/apu/APU"
import { CPU } from "../gameboy/cpu/CPU"
import { Memory } from "../gameboy/cpu/Memory"
import { GPU } from "../gameboy/gpu/GPU"

const memory = new Memory()
const gpu: GPU = jest.createMockFromModule("../gameboy/gpu/GPU")
const apu: APU = jest.createMockFromModule("../gameboy/apu")
const cpu = new CPU(memory, gpu, apu)

test("it initializes registers to the proper values", () => {
  cpu.initialize()

  const { registers } = cpu

  expect(registers.AF.value).toBe(0x1180)
  expect(registers.BC.value).toBe(0x0)
  expect(registers.DE.value).toBe(0xff56)
  expect(registers.HL.value).toBe(0xd)
  expect(registers.SP.value).toBe(0xfffe)
  expect(registers.PC.value).toBe(0x100)
})