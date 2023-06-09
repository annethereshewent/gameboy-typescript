import { Memory } from "../../cpu/Memory"
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"
import { ChannelFrequencyHighRegister } from "../registers/ChannelFrequencyHighRegister"
import { ChannelLengthTimerAndDutyRegister } from "../registers/ChannelLengthTimerAndDutyRegister"
import { ChannelVolumeAndEnvelopeRegister } from "../registers/ChannelVolumeAndEnvelopeRegister"
import { MasterVolumeAndVinPanningRegister } from "../registers/MasterVolumeAndVinPanningRegister"
import { SoundOnRegister } from "../registers/SoundOnRegister"
import { SoundPanningRegister } from "../registers/SoundPanningRegister"

export enum StereoChannel {
  Left,
  Right
}

export class Channel2 {
  // per https://nightshade256.github.io/2021/03/27/gb-sound-emulation.html
  private dutyTable = [
    [0,0,0,0,0,0,0,1], // 0%
    [0,0,0,0,0,0,1,1], // 25%
    [0,0,0,0,1,1,1,1], // 50%
    [1,1,1,1,1,1,0,0] // 75%
  ]

  private memory: Memory

  private channel2FrequencyLowRegister: MemoryRegister
  private channel2FrequencyHighRegister: ChannelFrequencyHighRegister
  private channel2LengthTimerAndDutyRegister: ChannelLengthTimerAndDutyRegister
  private channel2VolumeAndEnvelopeRegister: ChannelVolumeAndEnvelopeRegister

  private soundPanningRegister: SoundPanningRegister
  private soundOnRegister: SoundOnRegister
  private masterVolumeAndVinPanningRegister: MasterVolumeAndVinPanningRegister

  private volume = 0
  private periodTimer = 0
  private lengthTimer = 0

  constructor(memory: Memory) {
    this.memory = memory

    this.channel2LengthTimerAndDutyRegister = new ChannelLengthTimerAndDutyRegister(0xff16, this.memory)
    this.channel2VolumeAndEnvelopeRegister = new ChannelVolumeAndEnvelopeRegister(0xff17, this.memory)
    this.channel2FrequencyLowRegister = new MemoryRegister(0xff18, this.memory)
    this.channel2FrequencyHighRegister = new ChannelFrequencyHighRegister(0xff19, this.memory)

    this.soundOnRegister = new SoundOnRegister(this.memory)
    this.soundPanningRegister = new SoundPanningRegister(this.memory)
    this.masterVolumeAndVinPanningRegister = new MasterVolumeAndVinPanningRegister(this.memory)

    this.volume = this.channel2VolumeAndEnvelopeRegister.initialVolume
    this.lengthTimer = 64 - this.channel2LengthTimerAndDutyRegister.initialLengthTimer
  }

  frequencyTimer = this.getFrequencyTimer()
  waveDutyPosition = 0

  tick(cycles: number) {
    this.frequencyTimer -= cycles

    if (this.channel2FrequencyHighRegister.restartTrigger) {
      this.restartSound()
      this.channel2FrequencyHighRegister.restartTrigger = 0
    }

    if (this.frequencyTimer <= 0) {
      this.frequencyTimer = this.getFrequencyTimer()

      this.waveDutyPosition = (this.waveDutyPosition + 1) % 8
    }
  }

  private restartSound() {
    this.soundOnRegister.isChannel2On = 1

    this.periodTimer = this.channel2VolumeAndEnvelopeRegister.sweepPace
    this.volume = this.channel2VolumeAndEnvelopeRegister.initialVolume

    this.frequencyTimer = this.getFrequencyTimer()
    this.lengthTimer = 64 - this.channel2LengthTimerAndDutyRegister.initialLengthTimer
  }

  getSample(channel: StereoChannel) {
    const amplitude = this.dutyTable[this.channel2LengthTimerAndDutyRegister.waveDuty][this.waveDutyPosition]

    let channelVolume = 0

    if (channel === StereoChannel.Left && this.soundPanningRegister.mixChannel2Left) {
      channelVolume = this.masterVolumeAndVinPanningRegister.leftVolume
    } else if (channel === StereoChannel.Right && this.soundPanningRegister.mixChannel2Right) {
      channelVolume = this.masterVolumeAndVinPanningRegister.rightVolume
    }

    let sampleWithVolume = 0

    if (this.volume !== 0 && this.soundOnRegister.isChannel2On) {
      sampleWithVolume = amplitude * (channelVolume + this.volume)
    }

    return (sampleWithVolume / 7.5) - 1.0
  }

  clockLength() {
    if (this.channel2FrequencyHighRegister.soundLengthEnable) {
      this.lengthTimer--

      if (this.lengthTimer === 0) {
        this.soundOnRegister.isChannel2On = 0
      }
    }
  }

  clockVolume() {
    const { sweepPace, envelopeDirection } = this.channel2VolumeAndEnvelopeRegister
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

  private getFrequencyTimer() {
    return (2048 - this.getFrequency()) * 4
  }

  private getFrequency() {
    return this.channel2FrequencyLowRegister.value | (this.channel2FrequencyHighRegister.frequencyHighBits << 8)
  }
}