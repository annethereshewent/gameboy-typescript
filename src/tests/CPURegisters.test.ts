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

  expect(registers.A.value).toBe(0xff)
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

test("it performs writeToMemoryRegisterAddr properly", () => {
  registers.BC.value = 0x8200
  registers.A.value = 5

  registers.writeToMemoryRegisterAddr(registers.BC, registers.A)

  expect(memory.readByte(0x8200)).toBe(5)
})

test("it performs writeToMemory16Bit properly", () => {
  registers.PC.value = 1
  memory.gameDataView?.setUint16(1, 0x8800, true)

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

  memory.gameDataView?.setUint8(1, 0xda)

  registers.writeByteIntoRegisterAddress(registers.HL)

  expect(memory.readByte(registers.HL.value)).toBe(0xda)
})

test("it performs swap properly", () => {
  registers.A.value = 0b11101110

  registers.swap(registers.A)

  expect(registers.A.value).toBe(0b01101111)
})

test("it performs resetBit properly", () => {
  registers.A.value = 0b11011011

  registers.resetBit(3, registers.A)

  expect(registers.A.value).toBe(0b11010011)
})

test("it performs loadWord properly", () => {
  memory.gameDataView?.setUint16(1, 0xf0f0)

  registers.PC.value = 1

  registers.loadWord(registers.BC)

  expect(registers.BC.value).toBe(0xf0f0)
})

test("it performs writeStackPointerToMemory properly", () => {
  memory.gameDataView?.setUint16(1, 0x8080)

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