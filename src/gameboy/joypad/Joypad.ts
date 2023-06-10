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
  gamepad: Gamepad|null
  constructor(gamepad: Gamepad|null) {
    this.gamepad = gamepad
  }

  static isUpKeyPressed = false
  static isDownKeyPressed = false
  static isRightKeyPressed = false
  static isLeftKeyPressed = false
  static isEnterKeyPressed = false
  static isShiftKeyPressed = false
  static isSKeyPressed = false
  static isAKeyPressed = false

  static handleInput() {
    const gamepad = navigator.getGamepads()[0]

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

  isPressingLeft(): boolean {
    const axes = this.gamepad?.axes[0] || 0
    return this.gamepad?.buttons[GamepadButtons.Left].pressed || axes < -0.1 || Joypad.isLeftKeyPressed
  }

  isPressingRight(): boolean {
    const axes = this.gamepad?.axes[0] || 0
    return this.gamepad?.buttons[GamepadButtons.Right]?.pressed || axes > 0.1 || Joypad.isRightKeyPressed
  }

  isPressingUp(): boolean {
    const axes = this.gamepad?.axes[1] || 0
    return this.gamepad?.buttons[GamepadButtons.Up].pressed || axes < -0.1 || Joypad.isUpKeyPressed
  }

  isPressingDown(): boolean {
    const axes = this.gamepad?.axes[1] || 0
    return this.gamepad?.buttons[GamepadButtons.Down].pressed || axes > 0.1 || Joypad.isDownKeyPressed
  }

  isPressingA(): boolean {
    return this.gamepad?.buttons[GamepadButtons.A].pressed || Joypad.isSKeyPressed
  }

  isPressingB(): boolean {
    return this.gamepad?.buttons[GamepadButtons.X].pressed || Joypad.isAKeyPressed
  }

  isPressingStart(): boolean {
    return this.gamepad?.buttons[GamepadButtons.Start].pressed || Joypad.isEnterKeyPressed
  }

  isPressingSelect(): boolean {
    return this.gamepad?.buttons[GamepadButtons.Select].pressed || Joypad.isShiftKeyPressed
  }
}

