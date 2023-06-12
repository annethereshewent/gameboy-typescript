import { Memory } from "../../cpu/Memory"
import { getBit, setBit } from "../../misc/BitOperations"
import { Channel4ControlRegister } from "../registers/Channel4ControlRegister"
import { Channel4LengthTimerRegister } from "../registers/Channel4LengthTimerRegister"
import { ChannelFrequencyAndRandomnessRegister } from "../registers/ChannelFrequencyAndRandomnessRegister"
import { ChannelVolumeAndEnvelopeRegister } from "../registers/ChannelVolumeAndEnvelopeRegister"
import { SoundOnRegister } from "../registers/SoundOnRegister"

export class Channel4 {

  private channel4LengthTimerRegister: Channel4LengthTimerRegister
  private channelVolumeAndEnvelopeRegister: ChannelVolumeAndEnvelopeRegister
  private channelFrequencyAndRandomnessRegister: ChannelFrequencyAndRandomnessRegister

  private soundOnRegister: SoundOnRegister

  private channel4ControlRegister: Channel4ControlRegister
  private memory: Memory

  private readonly divisors = [8, 16, 32, 48, 64, 80, 96, 112]

  private frequencyTimer = 0
  private lengthTimer = 0

  private volume = 0

  private linearFeedbackShift = 0

  private periodTimer = 0

  constructor(memory: Memory) {
    this.memory = memory
    this.channel4LengthTimerRegister = new Channel4LengthTimerRegister(this.memory)
    this.channelVolumeAndEnvelopeRegister = new ChannelVolumeAndEnvelopeRegister(0xff21, this.memory)
    this.channelFrequencyAndRandomnessRegister = new ChannelFrequencyAndRandomnessRegister(this.memory)
    this.channel4ControlRegister = new Channel4ControlRegister(this.memory)

    this.soundOnRegister = new SoundOnRegister(this.memory)
  }

  tick(cycles: number) {

    if (this.channel4ControlRegister.restartTrigger) {
      this.restartSound()
    }
    this.frequencyTimer -= cycles
    if (this.frequencyTimer === 0) {
      this.frequencyTimer = this.getFrequencyTimer()

      const xorResult = getBit(this.linearFeedbackShift, 0) ^ getBit(this.linearFeedbackShift, 1)

      this.linearFeedbackShift = (this.linearFeedbackShift >> 1) | (xorResult << 14)

      if (this.channelFrequencyAndRandomnessRegister.lfsrWidth === 1) {
        this.linearFeedbackShift = setBit(this.linearFeedbackShift, 6, xorResult)
      }
    }
  }

  clockLength() {
    if (this.channel4ControlRegister.soundLengthEnable) {
      this.lengthTimer--

      if (this.lengthTimer === 0) {
        this.soundOnRegister.isChannel4On = 0
      }
    }
  }

  clockVolume() {
    const { sweepPace, envelopeDirection } = this.channelVolumeAndEnvelopeRegister
    if (sweepPace !== 0) {
      if (this.periodTimer !== 0) {
        this.periodTimer--
      }

      if (this.periodTimer === 0) {
        this.periodTimer = sweepPace

        if (envelopeDirection === 0 && this.volume > 0) {
          this.volume--
        } else if (envelopeDirection === 1 && this.volume < 0xf) {
          this.volume++
        }
      }
    }
  }

  getSample() {
    const sampleWithVolume = (~this.linearFeedbackShift & 0b1) * this.volume

    if (this.soundOnRegister.isChannel4On) {
      return (sampleWithVolume / 7.5) - 1
    } else {
      return 0
    }
  }

  private restartSound() {
    this.soundOnRegister.isChannel4On = 1
    this.frequencyTimer = this.getFrequencyTimer()
    this.linearFeedbackShift = 0b111111111111111
  }

  private getFrequencyTimer() {
    const divisor = this.divisors[this.channelFrequencyAndRandomnessRegister.divisorCode]

    return divisor << this.channelFrequencyAndRandomnessRegister.clockShift
  }
}