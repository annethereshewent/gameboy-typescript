import { CPU } from "../gameboy/cpu/CPU"
import { Memory } from "../gameboy/cpu/Memory"

const memory = new Memory()
const cpu = new CPU(memory)

cpu.loadCartridge(new ArrayBuffer(0x1000))
const { registers } = cpu


test("it performs swap properly", () => {
  registers.A.value = 0b11001110

  registers.swap(registers.A)

  expect(registers.A.value).toBe(0b11101100)
})

test("it performs resetBit properly", () => {
  registers.A.value = 0b11011011

  registers.resetBit(3, registers.A)

  expect(registers.A.value).toBe(0b11010011)
})

test("it performs setBit properly", () => {
  registers.A.value = 0b11011001

  registers.A.setBit(2, 1)

  expect(registers.A.value).toBe(0b11011101)
})

test("it performs rotateLeft properly", () => {
  registers.A.value = 0b10101011

  registers.rotateLeft()

  expect(registers.A.value).toBe(0b01010111)
})

test("it performs rotateLeftCarry properly", () => {
  registers.A.value = 0b10101011

  registers.F.carry = false

  registers.rotateLeftCarry()

  expect(registers.A.value).toBe(0b01010110)
})

test("it performs rotateRight properly", () => {
  registers.A.value = 0b11100011

  registers.rotateRight()

  expect(registers.A.value).toBe(0b11110001)
})

test("it performs rotateRightCarry properly", () => {
  registers.A.value = 0b10101011

  registers.F.carry = true

  registers.rotateRightCarry()

  expect(registers.A.value).toBe(0b11010101)
})

test("it performs rotateRegisterRight properly", () => {
  registers.D.value = 0b10101011

  registers.rotateRegisterRight(registers.D)

  expect(registers.D.value).toBe(0b11010101)
})

test("it performs shiftLeft properly", () => {
  registers.A.value = 0b11010111

  registers.shiftLeft(registers.A)

  expect(registers.A.value).toBe(0b10101110)
  expect(registers.F.carry).toBe(true)
  expect(registers.F.halfCarry).toBe(false)
  expect(registers.F.zero).toBe(false)
  expect(registers.F.subtract).toBe(false)
})

test("it performs shiftRight properly", () => {
  registers.A.value = 0b11010110

  registers.shiftRight(registers.A)

  expect(registers.A.value).toBe(0b11101011)
  expect(registers.F.carry).toBe(false)
  expect(registers.F.halfCarry).toBe(false)
  expect(registers.F.zero).toBe(false)
  expect(registers.F.subtract).toBe(false)
})

test("it performs testBit properly", () => {
  registers.A.value = 0b1010110

  registers.testBit(3, registers.A)

  expect(registers.F.zero).toBe(true)
})