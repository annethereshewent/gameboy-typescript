import { APU } from "../gameboy/apu/APU"
import { CPU } from "../gameboy/cpu/CPU"
import { Memory } from "../gameboy/cpu/Memory"
import { GPU } from "../gameboy/gpu/GPU"

const memory = new Memory()
const gpu: GPU = jest.createMockFromModule("../gameboy/gpu/GPU")
const apu: APU = jest.createMockFromModule("../gameboy/apu")

const cpu = new CPU(memory, gpu, apu)

const arrayBuffer = new ArrayBuffer(0x1000)
const gameDataView = new DataView(arrayBuffer)

cpu.loadCartridge(arrayBuffer)
const { registers } = cpu

test("it performs add properly", () => {
  registers.A.value = 0xff
  registers.B.value = 1

  registers.add(registers.A, registers.B)

  expect(registers.A.value).toBe(0)
  expect(registers.F.carry).toBe(true)
  expect(registers.F.subtract).toBe(false)
  expect(registers.F.halfCarry).toBe(true)
  expect(registers.F.zero).toBe(true)
})

test("it performs addWithCarry properly", () => {
registers.A.value = 254
registers.D.value = 1

registers.F.carry = true

registers.addWithCarry(registers.D)

expect(registers.A.value).toBe(0)
expect(registers.F.carry).toBe(true)
expect(registers.F.subtract).toBe(false)
expect(registers.F.halfCarry).toBe(true)
expect(registers.F.zero).toBe(true)
})

test("it performs addWithCarryImmediate properly", () => {
  registers.PC.value = 0x100
  gameDataView.setUint8(0x100, 1)

  registers.F.carry = true

  registers.A.value = 254

  registers.addWithCarryImmediate()


  expect(registers.A.value).toBe(0)
  expect(registers.F.carry).toBe(true)
  expect(registers.F.subtract).toBe(false)
  expect(registers.F.halfCarry).toBe(true)
  expect(registers.F.zero).toBe(true)
})

test("it performs subtractWithCarry properly", () => {
registers.A.value = 1
registers.B.value = 1

registers.F.carry = true

registers.subtractWithCarry(registers.B)

expect(registers.A.value).toBe(0xff)
expect(registers.F.carry).toBe(true)
expect(registers.F.subtract).toBe(true)
expect(registers.F.zero).toBe(false)
expect(registers.F.halfCarry).toBe(true)
})
