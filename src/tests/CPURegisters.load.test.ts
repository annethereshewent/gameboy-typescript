import { CPU } from "../gameboy/cpu/CPU"
import { Memory } from "../gameboy/cpu/Memory"

const memory = new Memory()
const cpu = new CPU(memory)

const arrayBuffer = new ArrayBuffer(0x1000)
const gameDataView = new DataView(arrayBuffer)

const { registers } = cpu
cpu.loadCartridge(arrayBuffer)

test('it performs memory operations properly', () => {
  memory.writeByte(0x8000, 1)
  memory.writeWord(0x8002, 0xffff)

  expect(memory.readByte(0x8000)).toBe(1)
  expect(memory.readWord(0x8002)).toBe(0xffff)
})

test("it performs loadFrom16bitAddr properly", () => {

  registers.A.value = 0
  gameDataView.setUint16(1, 0xc058, true)
  memory.writeByte(0xc058, 0xff)

  registers.PC.value = 1

  registers.loadFrom16bitAddr(registers.A)

  expect(registers.A.value).toBe(0xff)
})

test("it performs loadByte properly", () => {
  registers.A.value = 0
  registers.BC.value = 0xc059

  memory.writeByte(0xc059, 0xf9)

  registers.loadByte(registers.A, registers.BC)


  expect(registers.A.value).toBe(0xf9)
})

test("it performs readByte properly", () => {
  registers.PC.value = 1

  gameDataView.setUint8(1, 0xab)

  registers.readByte(registers.A)

  expect(registers.A.value).toBe(0xab)
})

test("it performs writeToMemoryRegisterAddr properly", () => {
  registers.BC.value = 0x8200
  registers.A.value = 5

  registers.writeToMemoryRegisterAddr(registers.BC, registers.A)

  expect(memory.readByte(0x8200)).toBe(5)
})

test("it performs writeToMemory16Bit properly", () => {
  registers.PC.value = 1
  gameDataView.setUint16(1, 0x8800, true)

  registers.A.value = 0xff

  registers.writeToMemory16bit(registers.A)

  expect(memory.readByte(0x8800)).toBe(0xff)
})

test("it performs writeToMemoryRegisterAddrAndIncrementTarget properly", () => {
  registers.HL.value = 0x8000
  const oldValue = registers.HL.value

  registers.A.value = 0xaa

  registers.writeToMemoryRegisterAddrAndIncrementTarget(registers.HL, registers.A)

  expect(memory.readByte(oldValue)).toBe(0xaa)
  expect(registers.HL.value).toBe(oldValue+1)
})

test("it performs writeToMemoryRegisterAddrAndDecrementTarget properly", () => {
  registers.HL.value = 0x8800
  const oldValue = registers.HL.value

  registers.A.value = 0xab

  registers.writeToMemoryRegisterAddrAndDecrementTarget(registers.HL, registers.A)

  expect(memory.readByte(oldValue)).toBe(0xab)
  expect(registers.HL.value).toBe(oldValue-1)
})

test("it performs writeByteIntoRegisterAddress properly", () => {
  registers.HL.value = 0x9000

  registers.PC.value = 1

  gameDataView.setUint8(1, 0xda)

  registers.writeByteIntoRegisterAddress(registers.HL)

  expect(memory.readByte(registers.HL.value)).toBe(0xda)
})

test("it performs loadWord properly", () => {
  gameDataView.setUint16(1, 0xf0f0)

  registers.PC.value = 1

  registers.loadWord(registers.BC)

  expect(registers.BC.value).toBe(0xf0f0)
})

test("it performs writeStackPointerToMemory properly", () => {
  gameDataView.setUint16(1, 0x8080)

  registers.PC.value = 1

  registers.writeStackPointerToMemory()

  expect(memory.readWord(0x8080)).toBe(registers.SP.value)
})

test("popping and pushing to stack works as expected", () => {
  for (let i = 0; i < 5; i++) {
    registers.pushToStack(i)
  }

  const stackItems = []

  for (let i = 0; i < 5; i++) {
    stackItems.push(registers.popFromStack())
  }

  expect(stackItems).toEqual([4,3,2,1,0])
})