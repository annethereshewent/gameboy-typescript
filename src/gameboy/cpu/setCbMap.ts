import { CPU } from "./CPU"

export function setCbMap(this: CPU) {
  this.cbMap.set(0x0, {
    name: "",
    cycleTime: 8,
    operation: () => {

    }
  })

  this.cbMap.set(0x87, {
    name: "RES 0, A",
    cycleTime: 8,
    operation: () => {
      this.registers.A.value = this.registers.A.value & ~(0b1)

      console.log(`register A's value is now ${this.registers.A.value}`)
    }
  })

  // this.cbMap.set(, {
  //   name: "",
  //   cycleTime: 8,
  //   operation: () => {

  //   }
  // })

  // this.cbMap.set(, {
  //   name: "",
  //   cycleTime: 8,
  //   operation: () => {

  //   }
  // })

  // this.cbMap.set(, {
  //   name: "",
  //   cycleTime: 8,
  //   operation: () => {

  //   }
  // })

  // this.cbMap.set(, {
  //   name: "",
  //   cycleTime: 8,
  //   operation: () => {

  //   }
  // })

  // this.cbMap.set(, {
  //   name: "",
  //   cycleTime: 8,
  //   operation: () => {

  //   }
  // })

  // this.cbMap.set(, {
  //   name: "",
  //   cycleTime: 8,
  //   operation: () => {

  //   }
  // })

  // this.cbMap.set(, {
  //   name: "",
  //   cycleTime: 8,
  //   operation: () => {

  //   }
  // })

  // this.cbMap.set(, {
  //   name: "",
  //   cycleTime: 8,
  //   operation: () => {

  //   }
  // })

  // this.cbMap.set(, {
  //   name: "",
  //   cycleTime: 8,
  //   operation: () => {

  //   }
  // })

  // this.cbMap.set(, {
  //   name: "",
  //   cycleTime: 8,
  //   operation: () => {

  //   }
  // })

  // this.cbMap.set(, {
  //   name: "",
  //   cycleTime: 8,
  //   operation: () => {

  //   }
  // })

  // this.cbMap.set(, {
  //   name: "",
  //   cycleTime: 8,
  //   operation: () => {

  //   }
  // })

  // this.cbMap.set(, {
  //   name: "",
  //   cycleTime: 8,
  //   operation: () => {

  //   }
  // })

  // this.cbMap.set(, {
  //   name: "",
  //   cycleTime: 8,
  //   operation: () => {

  //   }
  // })

}