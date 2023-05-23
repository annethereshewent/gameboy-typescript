import { CPU } from "../gameboy/cpu/CPU"
import { Memory } from "../gameboy/cpu/Memory"
import { GPU } from "../gameboy/gpu/GPU"

const memory = new Memory()
const gpu: GPU = jest.createMockFromModule("../gameboy/gpu/GPU")
const cpu = new CPU(memory, gpu)

test("it initializes registers to the proper values", () => {
  cpu.initialize()

  const { registers } = cpu

  expect(registers.AF.value).toBe(0x11b0)
  expect(registers.BC.value).toBe(0x13)
  expect(registers.DE.value).toBe(0xd8)
  expect(registers.HL.value).toBe(0x14d)
  expect(registers.SP.value).toBe(0xfffe)
  expect(registers.PC.value).toBe(0x100)
})