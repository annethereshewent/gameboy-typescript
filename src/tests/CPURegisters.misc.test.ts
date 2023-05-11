import { CPU } from "../gameboy/cpu/CPU"
import { Memory } from "../gameboy/cpu/Memory"

const memory = new Memory()
const cpu = new CPU(memory)

cpu.loadCartridge(new ArrayBuffer(0x1000))

test("it initializes registers to the proper values", () => {
  cpu.initialize()

  const { registers } = cpu

  expect(registers.AF.value).toBe(0x1b0)
  expect(registers.BC.value).toBe(0x13)
  expect(registers.DE.value).toBe(0xd8)
  expect(registers.HL.value).toBe(0x14d)
  expect(registers.SP.value).toBe(0xfffe)
  expect(registers.PC.value).toBe(0x100)
})