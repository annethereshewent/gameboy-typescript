import { CPU } from "./CPU"

export function setCbMap(this: CPU) {
  this.cbMap.set(0x0, {
    name: "RLC B",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterLeft(this.registers.B)
    }
  })

  this.cbMap.set(0x1, {
    name: "RLC C",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterLeft(this.registers.C)
    }
  })

  this.cbMap.set(0x2, {
    name: "RLC D",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterLeft(this.registers.D)
    }
  })

  this.cbMap.set(0x3, {
    name: "RLC E",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterLeft(this.registers.E)
    }
  })

  this.cbMap.set(0x4, {
    name: "RLC H",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterLeft(this.registers.H)
    }
  })

  this.cbMap.set(0x5, {
    name: "RLC L",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterLeft(this.registers.L)
    }
  })

  this.cbMap.set(0x6, {
    name: "RLC (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.rotateValueAtRegisterAddrLeft()
    }
  })

  this.cbMap.set(0x7, {
    name: "RLC A",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterLeft(this.registers.A)
    }
  })

  this.cbMap.set(0x8, {
    name: "RRC B",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterRight(this.registers.B)
    }
  })

  this.cbMap.set(0x9, {
    name: "RRC C",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterRight(this.registers.C)
    }
  })

  this.cbMap.set(0xa, {
    name: "RRC D",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterRight(this.registers.D)
    }
  })

  this.cbMap.set(0xb, {
    name: "RRC E",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterRight(this.registers.E)
    }
  })

  this.cbMap.set(0xc, {
    name: "RRC H",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterRight(this.registers.H)
    }
  })

  this.cbMap.set(0xd, {
    name: "RRC L",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterRight(this.registers.L)
    }
  })

  this.cbMap.set(0xe, {
    name: "RRC (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.rotateValueAtRegisterAddrRight()
    }
  })

  this.cbMap.set(0xf, {
    name: "RRC A",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterRight(this.registers.A)
    }
  })

  this.cbMap.set(0x10, {
    name: "RL B",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterLeftCarry(this.registers.B)
    }
  })

  this.cbMap.set(0x11, {
    name: "RL C",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterLeftCarry(this.registers.C)
    }
  })

  this.cbMap.set(0x12, {
    name: "RL D",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterLeftCarry(this.registers.D)
    }
  })

  this.cbMap.set(0x13, {
    name: "RL E",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterLeftCarry(this.registers.E)
    }
  })

  this.cbMap.set(0x14, {
    name: "RL H",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterLeftCarry(this.registers.H)
    }
  })

  this.cbMap.set(0x15, {
    name: "RL L",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterLeftCarry(this.registers.L)
    }
  })

  this.cbMap.set(0x16, {
    name: "RL (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.rotateAtRegisterAddrLeftCarry()
    }
  })

  this.cbMap.set(0x17, {
    name: "RL A",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterLeftCarry(this.registers.A)
    }
  })

  this.cbMap.set(0x18, {
    name: "RR B",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterRightCarry(this.registers.B)
    }
  })

  this.cbMap.set(0x19, {
    name: "RR C",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterRightCarry(this.registers.C)
    }
  })

  this.cbMap.set(0x1a, {
    name: "RR D",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterRightCarry(this.registers.D)
    }
  })

  this.cbMap.set(0x1b, {
    name: "RR E",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterRightCarry(this.registers.E)
    }
  })

  this.cbMap.set(0x1c, {
    name: "RR H",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterRightCarry(this.registers.H)
    }
  })

  this.cbMap.set(0x1d, {
    name: "RR L",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterRightCarry(this.registers.L)
    }
  })

  this.cbMap.set(0x1e, {
    name: "RR (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.rotateAtRegisterAddrRightCarry()
    }
  })

  this.cbMap.set(0x1f, {
    name: "RR A",
    cycleTime: 8,
    operation: () => {
      this.registers.rotateRegisterRightCarry(this.registers.A)
    }
  })

  this.cbMap.set(0x20, {
    name: "SLA B",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftLeft(this.registers.B)
    }
  })

  this.cbMap.set(0x21, {
    name: "SLA C",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftLeft(this.registers.C)
    }
  })

  this.cbMap.set(0x22, {
    name: "SLA D",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftLeft(this.registers.D)
    }
  })

  this.cbMap.set(0x23, {
    name: "SLA E",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftLeft(this.registers.E)
    }
  })

  this.cbMap.set(0x24, {
    name: "SLA H",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftLeft(this.registers.H)
    }
  })

  this.cbMap.set(0x25, {
    name: "SLA L",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftLeft(this.registers.L)
    }
  })

  this.cbMap.set(0x26, {
    name: "SLA (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.shiftLeftAtRegisterAddr()
    }
  })

  this.cbMap.set(0x27, {
    name: "SLA A",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftLeft(this.registers.A)
    }
  })

  this.cbMap.set(0x28, {
    name: "SRA B",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftRight(this.registers.B)
    }
  })

  this.cbMap.set(0x29, {
    name: "SRA C",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftRight(this.registers.C)
    }
  })

  this.cbMap.set(0x2a, {
    name: "SRA D",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftRight(this.registers.D)
    }
  })

  this.cbMap.set(0x2b, {
    name: "SRA E",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftRight(this.registers.E)
    }
  })

  this.cbMap.set(0x2c, {
    name: "SRA H",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftRight(this.registers.H)
    }
  })

  this.cbMap.set(0x2d, {
    name: "SRA L",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftRight(this.registers.L)
    }
  })

  this.cbMap.set(0x2e, {
    name: "SRA (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.shiftRightAtRegisterAddr()
    }
  })

  this.cbMap.set(0x2f, {
    name: "SRA A",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftRight(this.registers.A)
    }
  })

  this.cbMap.set(0x30, {
    name: "SWAP B",
    cycleTime: 8,
    operation: () => {
      this.registers.swap(this.registers.B)
    }
  })

  this.cbMap.set(0x31, {
    name: "SWAP C",
    cycleTime: 8,
    operation: () => {
      this.registers.swap(this.registers.C)
    }
  })

  this.cbMap.set(0x32, {
    name: "SWAP D",
    cycleTime: 8,
    operation: () => {
      this.registers.swap(this.registers.D)
    }
  })

  this.cbMap.set(0x33, {
    name: "SWAP E",
    cycleTime: 8,
    operation: () => {
      this.registers.swap(this.registers.E)
    }
  })

  this.cbMap.set(0x34, {
    name: "SWAP H",
    cycleTime: 8,
    operation: () => {
      this.registers.swap(this.registers.H)
    }
  })

  this.cbMap.set(0x35, {
    name: "SWAP L",
    cycleTime: 8,
    operation: () => {
      this.registers.swap(this.registers.L)
    }
  })

  this.cbMap.set(0x36, {
    name: "SWAP (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.swapAtRegisterAddr()
    }
  })

  this.cbMap.set(0x37, {
    name: "SWAP A",
    cycleTime: 8,
    operation: () => {
      this.registers.swap(this.registers.A)
    }
  })

  this.cbMap.set(0x38, {
    name: "SRL B",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftRightCarry(this.registers.B)
    }
  })

  this.cbMap.set(0x39, {
    name: "SRL C",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftRightCarry(this.registers.C)
    }
  })

  this.cbMap.set(0x3a, {
    name: "SRL D",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftRightCarry(this.registers.D)
    }
  })

  this.cbMap.set(0x3b, {
    name: "SRL E",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftRightCarry(this.registers.E)
    }
  })

  this.cbMap.set(0x3c, {
    name: "SRL H",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftRightCarry(this.registers.H)
    }
  })

  this.cbMap.set(0x3d, {
    name: "SRL L",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftRightCarry(this.registers.L)
    }
  })

  this.cbMap.set(0x3e, {
    name: "SRL (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.shiftRightCarryAtRegisterAddr()
    }
  })

  this.cbMap.set(0x3f, {
    name: "SRL A",
    cycleTime: 8,
    operation: () => {
      this.registers.shiftRightCarry(this.registers.A)
    }
  })

  this.cbMap.set(0x40, {
    name: "BIT 0, B",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(0, this.registers.B)
    }
  })

  this.cbMap.set(0x41, {
    name: "BIT 0, C",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(0, this.registers.C)
    }
  })

  this.cbMap.set(0x42, {
    name: "BIT 0, D",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(0, this.registers.D)
    }
  })

  this.cbMap.set(0x43, {
    name: "BIT 0, E",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(0, this.registers.E)
    }
  })

  this.cbMap.set(0x44, {
    name: "BIT 0, H",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(0, this.registers.H)
    }
  })

  this.cbMap.set(0x45, {
    name: "BIT 0, L",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(0, this.registers.L)
    }
  })

  this.cbMap.set(0x46, {
    name: "BIT 0, (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.testBitAtRegisterAddr(0)
    }
  })

  this.cbMap.set(0x47, {
    name: "BIT 0, A",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(0, this.registers.A)
    }
  })

  this.cbMap.set(0x48, {
    name: "BIT 1, B",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(1, this.registers.B)
    }
  })

  this.cbMap.set(0x49, {
    name: "BIT 1, C",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(1, this.registers.C)
    }
  })

  this.cbMap.set(0x4a, {
    name: "BIT 1, D",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(1, this.registers.D)
    }
  })

  this.cbMap.set(0x4b, {
    name: "BIT 1, E",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(1, this.registers.E)
    }
  })

  this.cbMap.set(0x4c, {
    name: "BIT 1, H",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(1, this.registers.H)
    }
  })

  this.cbMap.set(0x4d, {
    name: "BIT 1, L",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(1, this.registers.L)
    }
  })

  this.cbMap.set(0x4e, {
    name: "BIT 1, (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.testBitAtRegisterAddr(1)
    }
  })

  this.cbMap.set(0x4f, {
    name: "BIT 1, A",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(1, this.registers.A)
    }
  })

  this.cbMap.set(0x50, {
    name: "BIT 2, B",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(2, this.registers.B)
    }
  })

  this.cbMap.set(0x51, {
    name: "BIT 2, C",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(2, this.registers.C)
    }
  })

  this.cbMap.set(0x52, {
    name: "BIT 2, D",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(2, this.registers.D)
    }
  })

  this.cbMap.set(0x53, {
    name: "BIT 2, E",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(2, this.registers.E)
    }
  })

  this.cbMap.set(0x54, {
    name: "BIT 2, H",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(2, this.registers.H)
    }
  })

  this.cbMap.set(0x55, {
    name: "BIT 2, L",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(2, this.registers.L)
    }
  })

  this.cbMap.set(0x56, {
    name: "BIT 2, (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.testBitAtRegisterAddr(2)
    }
  })

  this.cbMap.set(0x57, {
    name: "BIT 2, A",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(2, this.registers.A)
    }
  })

  this.cbMap.set(0x58, {
    name: "BIT 3, B",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(3, this.registers.B)
    }
  })

  this.cbMap.set(0x59, {
    name: "BIT 3, C",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(3, this.registers.C)
    }
  })

  this.cbMap.set(0x5a, {
    name: "BIT 3, D",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(3, this.registers.D)
    }
  })

  this.cbMap.set(0x5b, {
    name: "BIT 3, E",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(3, this.registers.E)
    }
  })

  this.cbMap.set(0x5c, {
    name: "BIT 3, H",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(3, this.registers.H)
    }
  })

  this.cbMap.set(0x5d, {
    name: "BIT 3, L",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(3, this.registers.L)
    }
  })

  this.cbMap.set(0x5e, {
    name: "BIT 3, (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.testBitAtRegisterAddr(3)
    }
  })

  this.cbMap.set(0x5f, {
    name: "BIT 3, A",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(3, this.registers.A)
    }
  })

  this.cbMap.set(0x60, {
    name: "BIT 4, B",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(4, this.registers.B)
    }
  })

  this.cbMap.set(0x61, {
    name: "BIT 4, C",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(4, this.registers.C)
    }
  })

  this.cbMap.set(0x62, {
    name: "BIT 4, D",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(4, this.registers.D)
    }
  })

  this.cbMap.set(0x63, {
    name: "BIT 4, E",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(4, this.registers.E)
    }
  })

  this.cbMap.set(0x64, {
    name: "BIT 4, H",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(4, this.registers.H)
    }
  })

  this.cbMap.set(0x65, {
    name: "BIT 4, L",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(4, this.registers.L)
    }
  })

  this.cbMap.set(0x66, {
    name: "BIT 4, (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.testBitAtRegisterAddr(4)
    }
  })

  this.cbMap.set(0x67, {
    name: "BIT 4, A",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(4, this.registers.A)
    }
  })

  this.cbMap.set(0x68, {
    name: "BIT 5, B",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(5, this.registers.B)
    }
  })

  this.cbMap.set(0x69, {
    name: "BIT 5, C",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(5, this.registers.C)
    }
  })

  this.cbMap.set(0x6a, {
    name: "BIT 5, D",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(5, this.registers.D)
    }
  })

  this.cbMap.set(0x6b, {
    name: "BIT 5, E",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(5, this.registers.E)
    }
  })

  this.cbMap.set(0x6c, {
    name: "BIT 5, H",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(5, this.registers.H)
    }
  })

  this.cbMap.set(0x6d, {
    name: "BIT 5, L",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(5, this.registers.L)
    }
  })

  this.cbMap.set(0x6e, {
    name: "BIT 5, (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.testBitAtRegisterAddr(5)
    }
  })

  this.cbMap.set(0x6f, {
    name: "BIT 5, A",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(5, this.registers.A)
    }
  })

  this.cbMap.set(0x70, {
    name: "BIT 6, B",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(6, this.registers.B)
    }
  })

  this.cbMap.set(0x71, {
    name: "BIT 6, C",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(6, this.registers.C)
    }
  })

  this.cbMap.set(0x72, {
    name: "BIT 6, D",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(6, this.registers.D)
    }
  })

  this.cbMap.set(0x73, {
    name: "BIT 6, E",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(6, this.registers.E)
    }
  })

  this.cbMap.set(0x74, {
    name: "BIT 6, H",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(6, this.registers.H)
    }
  })

  this.cbMap.set(0x75, {
    name: "BIT 6, L",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(6, this.registers.L)
    }
  })

  this.cbMap.set(0x76, {
    name: "BIT 6, (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.testBitAtRegisterAddr(6)
    }
  })

  this.cbMap.set(0x77, {
    name: "BIT 6, A",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(6, this.registers.A)
    }
  })

  this.cbMap.set(0x78, {
    name: "BIT 7, B",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(7, this.registers.B)
    }
  })

  this.cbMap.set(0x79, {
    name: "BIT 7, C",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(7, this.registers.C)
    }
  })

  this.cbMap.set(0x7a, {
    name: "BIT 7, D",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(7, this.registers.D)
    }
  })

  this.cbMap.set(0x7b, {
    name: "BIT 7, E",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(7, this.registers.E)
    }
  })

  this.cbMap.set(0x7c, {
    name: "BIT 7, H",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(7, this.registers.H)
    }
  })

  this.cbMap.set(0x7d, {
    name: "BIT 7, L",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(7, this.registers.L)
    }
  })

  this.cbMap.set(0x7e, {
    name: "BIT 7, (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.testBitAtRegisterAddr(7)
    }
  })

  this.cbMap.set(0x7f, {
    name: "BIT 7, A",
    cycleTime: 8,
    operation: () => {
      this.registers.testBit(7, this.registers.A)
    }
  })

  this.cbMap.set(0x80, {
    name: "RES 0, B",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(0, this.registers.B)
    }
  })

  this.cbMap.set(0x81, {
    name: "RES 0, C",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(0, this.registers.C)
    }
  })

  this.cbMap.set(0x82, {
    name: "RES 0, D",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(0, this.registers.D)
    }
  })

  this.cbMap.set(0x83, {
    name: "RES 0, E",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(0, this.registers.E)
    }
  })
  this.cbMap.set(0x84, {
    name: "RES 0, H",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(0, this.registers.H)
    }
  })

  this.cbMap.set(0x85, {
    name: "RES 0, L",
    cycleTime: 16,
    operation: () => {
      this.registers.resetBit(0, this.registers.L)
    }
  })

  this.cbMap.set(0x86, {
    name: "RES 0, (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.resetBitAtRegisterAddr(0)
    }
  })

  this.cbMap.set(0x87, {
    name: "RES 0, A",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(0, this.registers.A)
    }
  })

  this.cbMap.set(0x88, {
    name: "RES 1, B",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(1, this.registers.B)
    }
  })

  this.cbMap.set(0x89, {
    name: "RES 1, C",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(1, this.registers.C)
    }
  })

  this.cbMap.set(0x8a, {
    name: "RES 1, D",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(1, this.registers.D)
    }
  })

  this.cbMap.set(0x8b, {
    name: "RES 1, E",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(1, this.registers.E)
    }
  })

  this.cbMap.set(0x8c, {
    name: "RES 1, H",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(1, this.registers.H)
    }
  })

  this.cbMap.set(0x8d, {
    name: "RES 1, L",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(1, this.registers.L)
    }
  })

  this.cbMap.set(0x8e, {
    name: "RES 1, (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.resetBitAtRegisterAddr(1)
    }
  })

  this.cbMap.set(0x8f, {
    name: "RES 1, A",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(1, this.registers.A)
    }
  })

  this.cbMap.set(0x90, {
    name: "RES 2, B",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(2, this.registers.B)
    }
  })

  this.cbMap.set(0x91, {
    name: "RES 2, C",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(2, this.registers.C)
    }
  })

  this.cbMap.set(0x92, {
    name: "RES 2, D",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(2, this.registers.D)
    }
  })

  this.cbMap.set(0x93, {
    name: "RES 2, E",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(2, this.registers.E)
    }
  })

  this.cbMap.set(0x94, {
    name: "RES 2, H",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(2, this.registers.H)
    }
  })

  this.cbMap.set(0x95, {
    name: "RES 2, L",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(2, this.registers.L)
    }
  })

  this.cbMap.set(0x96, {
    name: "RES 2, (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.resetBitAtRegisterAddr(2)
    }
  })

  this.cbMap.set(0x97, {
    name: "RES 2, A",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(2, this.registers.A)
    }
  })

  this.cbMap.set(0x98, {
    name: "RES 3, B",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(3, this.registers.B)
    }
  })

  this.cbMap.set(0x99, {
    name: "RES 3, C",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(3, this.registers.C)
    }
  })

  this.cbMap.set(0x9a, {
    name: "RES 3, D",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(3, this.registers.D)
    }
  })

  this.cbMap.set(0x9b, {
    name: "RES 3, E",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(3, this.registers.E)
    }
  })

  this.cbMap.set(0x9c, {
    name: "RES 3, H",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(3, this.registers.H)
    }
  })

  this.cbMap.set(0x9d, {
    name: "RES 3, L",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(3, this.registers.L)
    }
  })

  this.cbMap.set(0x9e, {
    name: "RES 3, (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.resetBit(3, this.registers.HL)
    }
  })

  this.cbMap.set(0x9f, {
    name: "RES 3, A",
    cycleTime: 8,
    operation: () => {
      this.registers.resetBit(3, this.registers.A)
    }
  })

  this.cbMap.set(0xb6, {
    name: "RES 6, (HL)",
    cycleTime: 16,
    operation: () => {
      this.registers.resetBitAtRegisterAddr(6)
    }
  })

  this.cbMap.set(0xcf, {
    name: "SET 1, A",
    cycleTime: 8,
    operation: () => {
      this.registers.A.setBit(1, 1)
    }
  })

}