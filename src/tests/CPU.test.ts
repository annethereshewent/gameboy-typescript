import { CPU } from "../gameboy/cpu/CPU"
import { Memory } from "../gameboy/cpu/Memory"

const memory = new Memory()
const cpu = new CPU(memory)

cpu.loadCartridge(new ArrayBuffer(0x1000))
const { registers } = cpu


test('it performs memory operations properly', () => {
  memory.writeByte(0x8000, 1)
  memory.writeWord(0x8002, 0xffff)

  expect(memory.readByte(0x8000)).toBe(1)
  expect(memory.readWord(0x8002)).toBe(0xffff)
})

test("it performs loadFrom16bitAddr properly", () => {

  registers.A.value = 0
  memory.gameDataView?.setUint16(1, 0xff00, true)
  memory.writeByte(0xff00, 0xff)

  registers.PC.value = 1

  registers.loadFrom16bitAddr(registers.A)

  expect(registers.A.value).toBe(255)
})

test("it performs loadByte properly", () => {
  registers.A.value = 0
  registers.BC.value = 0xff00

  memory.writeByte(0xff00, 0xf9)

  registers.loadByte(registers.A, registers.BC)


  expect(registers.A.value).toBe(0xf9)

})

test("it performs readByte properly", () => {
  registers.PC.value = 1

  memory.gameDataView?.setUint8(1, 0xab)

  registers.readByte(registers.A)

  expect(registers.A.value).toBe(0xab)
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