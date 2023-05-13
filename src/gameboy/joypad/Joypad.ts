import { joypadRegister } from "../cpu/memory_registers/JoypadRegister"

enum GamepadButtons {
  A,
  B,
  X,
  Y,
  LB,
  RB,
  LT,
  RT,
  Select,
  Start,
  L3,
  R3,
  Up,
  Down,
  Left,
  Right
}

export class Joypad {
  gamepad: Gamepad
  constructor(gamepad: Gamepad) {
    this.gamepad = gamepad
  }

  static handleInput() {
    const gamepad = navigator.getGamepads()[0]

    if (gamepad != null) {
      const joypad = new Joypad(gamepad)
      joypadRegister.isPressingLeft = joypad.isPressingLeft()
      joypadRegister.isPressingRight = joypad.isPressingRight()
      joypadRegister.isPressingDown = joypad.isPressingDown()
      joypadRegister.isPressingUp = joypad.isPressingUp()
      joypadRegister.isPressingA = joypad.isPressingA()
      joypadRegister.isPressingB = joypad.isPressingB()
      joypadRegister.isPressingSelect = joypad.isPressingSelect()
      joypadRegister.isPressingStart = joypad.isPressingStart()
    }
  }

  isPressingLeft(): boolean {
    return this.gamepad.buttons[GamepadButtons.Left].pressed || this.gamepad.axes[0] < -0.1
  }

  isPressingRight(): boolean {
    return this.gamepad.buttons[GamepadButtons.Right].pressed || this.gamepad.axes[0] > 0.1
  }

  isPressingUp(): boolean {
    return this.gamepad.buttons[GamepadButtons.Up].pressed || this.gamepad.axes[1] < -0.1
  }

  isPressingDown(): boolean {
    return this.gamepad.buttons[GamepadButtons.Down].pressed || this.gamepad.axes[1] > 0.1
  }

  isPressingA(): boolean {
    return this.gamepad.buttons[GamepadButtons.A].pressed
  }

  isPressingB(): boolean {
    return this.gamepad.buttons[GamepadButtons.B].pressed
  }

  isPressingStart(): boolean {
    return this.gamepad.buttons[GamepadButtons.Start].pressed
  }

  isPressingSelect(): boolean {
    return this.gamepad.buttons[GamepadButtons.Select].pressed
  }
}

