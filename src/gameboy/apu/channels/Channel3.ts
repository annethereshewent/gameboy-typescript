import { Memory } from "../../cpu/Memory"
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"
import { ChannelDACEnableRegister } from "../registers/ChannelDACEnableRegister"
import { ChannelFrequencyHighRegister } from "../registers/ChannelFrequencyHighRegister"
import { ChannelOutputLevelRegister } from "../registers/ChannelOutputLevelRegister"
import { SoundOnRegister } from "../registers/SoundOnRegister"


export class Channel3 {

  private memory: Memory

  private channelDACEnableRegister: ChannelDACEnableRegister
  private channelFrequencyLowRegister: MemoryRegister
  private channelFrequencyHighRegister: ChannelFrequencyHighRegister
  private channelLengthTimerRegister: MemoryRegister
  private channelOutputLevelRegister: ChannelOutputLevelRegister

  private soundOnRegister: SoundOnRegister

  private readonly sampleStartAddress = 0xff30

  private frequencyTimer = 0
  private samplePosition = 0

  private lengthTimer = 0

  // see https://nightshade256.github.io/2021/03/27/gb-sound-emulation.html
  protected volumeShifts = [4, 0, 1, 2]

  constructor(memory: Memory) {
    this.memory = memory

    this.channelDACEnableRegister = new ChannelDACEnableRegister(this.memory)
    this.channelLengthTimerRegister = new MemoryRegister(0xff1b, this.memory)
    this.channelOutputLevelRegister = new ChannelOutputLevelRegister(this.memory)
    this.channelFrequencyLowRegister = new MemoryRegister(0xff1d, this.memory)
    this.channelFrequencyHighRegister = new ChannelFrequencyHighRegister(0xff1e, this.memory)

    this.soundOnRegister = new SoundOnRegister(this.memory)
  }

  tick(cycles: number) {
    this.frequencyTimer -= cycles

    if (this.channelFrequencyHighRegister.restartTrigger) {
      this.restartSound()
      this.channelFrequencyHighRegister.restartTrigger = 0
    }

    if (this.frequencyTimer <= 0) {
      this.frequencyTimer = this.getFrequencyTimer()

      this.samplePosition = (this.samplePosition + 1) % 32
    }
  }

  clockLength() {
    if (this.channelFrequencyHighRegister.soundLengthEnable) {
      this.lengthTimer--

      if (this.lengthTimer === 0) {
        this.soundOnRegister.isChannel3On = 0
      }
    }
  }

  getSample() {
    const memoryIndex = Math.floor(this.samplePosition / 2)

    const isUpper = this.samplePosition % 2 === 0

    const byte = this.memory.readByte(this.sampleStartAddress + memoryIndex)

    const sample = isUpper ? byte >> 4 : byte & 0b1111

    const volumeAdjustedSample = sample >> this.volumeShifts[this.channelOutputLevelRegister.outputLevelSelection]

    if (this.soundOnRegister.isChannel3On && this.channelDACEnableRegister.dacEnabled) {
      return (volumeAdjustedSample / 7.5) - 1.0
    } else {
      return 0
    }
  }

  private restartSound() {
    this.soundOnRegister.isChannel3On = 1

    this.frequencyTimer = this.getFrequencyTimer()
    this.samplePosition = 0

    this.lengthTimer = 256 - this.channelLengthTimerRegister.value
  }

  private getFrequencyTimer() {
    return (2048 - this.getFrequency()) * 2
  }

  private getFrequency() {
    return this.channelFrequencyLowRegister.value | (this.channelFrequencyHighRegister.frequencyHighBits << 8)
  }

}