export interface Instruction {
  name: string
  operation: Function
  cycleTime: number
}

export interface CbInstruction extends Instruction {
  operation: () => number
}