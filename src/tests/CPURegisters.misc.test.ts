import { CPU } from "../gameboy/cpu/CPU"
import { Memory } from "../gameboy/cpu/Memory"

const memory = new Memory()
const cpu = new CPU(memory)

cpu.loadCartridge(new ArrayBuffer(0x1000))
const { registers } = cpu

test("it gets the correct cycle time", () => {
  // test CB and conditionals here
  registers.F.zero = false

  const instruction = cpu.instructionMap.get(0x20)

  let cycleTime = 0
  if (instruction != null) {
    cycleTime = typeof instruction.cycleTime === 'number' ? instruction.cycleTime : instruction.cycleTime()
  }

  expect(cycleTime).toBe(12)
})

test("it initializes registers to the proper values", () => {
  cpu.initialize()

  const { registers } = cpu

  expect(registers.AF.value).toBe(0x1b0)
  expect(registers.BC.value).toBe(0x13)
  expect(registers.DE.value).toBe(0xd8)
  expect(registers.HL.value).toBe(0x14d)
  expect(registers.SP.value).toBe(0xfffe)
  expect(registers.PC.value).toBe(0x100)

  expect(registers.joypadRegister.value).toBe(0xff)
})