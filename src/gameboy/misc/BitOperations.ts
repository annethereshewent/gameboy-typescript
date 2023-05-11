export function setBit(value: number, pos: number, bitValue: number) {
  let result = resetBit(value, pos)

  if (bitValue === 1) {
    result |= (bitValue << pos)
  }

  return result
}

export function getBit(value: number, pos: number): number {
  return (value >> pos) & 1
}

export function resetBit(value: number, pos: number): number {
  return value & ~(0b1 << pos)
}