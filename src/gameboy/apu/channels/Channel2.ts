import { Memory } from "../../cpu/Memory"
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister"
import { ChannelFrequencyHighRegister } from "../registers/ChannelFrequencyHighRegister"
import { ChannelLengthTimerAndDutyRegister } from "../registers/ChannelLengthTimerAndDutyRegister"
import { ChannelVolumeAndEnvelopeRegister } from "../registers/ChannelVolumeAndEnvelopeRegister"
import { MasterVolumeAndVinPanningRegister } from "../registers/MasterVolumeAndVinPanningRegister"
import { SoundOnRegister } from "../registers/SoundOnRegister"
import { SoundPanningRegister } from "../registers/SoundPanningRegister"

export class Channel2 {
  // per https://nightshade256.github.io/2021/03/27/gb-sound-emulation.html
  protected dutyTable = [
    [0,0,0,0,0,0,0,1], // 0%
    [0,0,0,0,0,0,1,1], // 25%
    [0,0,0,0,1,1,1,1], // 50%
    [1,1,1,1,1,1,0,0] // 75%
  ]
  // protected dutyTable = [
  //   [0, 0, 0, 0, 0, 0, 0, 1], // 12.5 %
  //   [1, 0, 0, 0, 0, 0, 0, 1], // 25 %
  //   [1, 0, 0, 0, 0, 1, 1, 1], // 50 %
  //   [0, 1, 1, 1, 1, 1, 1, 0], // 75 %
  // ]

  protected memory: Memory

  protected channelFrequencyLowRegister: MemoryRegister
  protected channelFrequencyHighRegister: ChannelFrequencyHighRegister
  protected channelLengthTimerAndDutyRegister: ChannelLengthTimerAndDutyRegister
  protected channelVolumeAndEnvelopeRegister: ChannelVolumeAndEnvelopeRegister

  protected soundPanningRegister: SoundPanningRegister
  protected soundOnRegister: SoundOnRegister
  protected masterVolumeAndVinPanningRegister: MasterVolumeAndVinPanningRegister

  protected volume = 0
  protected periodTimer = 0
  protected lengthTimer = 0

  protected frequencyTimer = 0
  protected waveDutyPosition = 0

  constructor(memory: Memory) {
    this.memory = memory

    this.channelLengthTimerAndDutyRegister = new ChannelLengthTimerAndDutyRegister(0xff16, this.memory)
    this.channelVolumeAndEnvelopeRegister = new ChannelVolumeAndEnvelopeRegister(0xff17, this.memory)
    this.channelFrequencyLowRegister = new MemoryRegister(0xff18, this.memory)
    this.channelFrequencyHighRegister = new ChannelFrequencyHighRegister(0xff19, this.memory)

    this.soundOnRegister = new SoundOnRegister(this.memory)
    this.soundPanningRegister = new SoundPanningRegister(this.memory)
    this.masterVolumeAndVinPanningRegister = new MasterVolumeAndVinPanningRegister(this.memory)
  }

  tick(cycles: number) {
    this.frequencyTimer -= cycles

    if (this.channelFrequencyHighRegister.restartTrigger) {
      this.restartSound()
      this.channelFrequencyHighRegister.restartTrigger = 0
    }

    if (this.frequencyTimer <= 0) {
      this.frequencyTimer = this.getFrequencyTimer()

      this.waveDutyPosition = (this.waveDutyPosition + 1) % 8
    }
  }

  protected restartSound() {
    this.soundOnRegister.isChannel2On = 1

    this.periodTimer = this.channelVolumeAndEnvelopeRegister.sweepPace
    this.volume = this.channelVolumeAndEnvelopeRegister.initialVolume

    this.frequencyTimer = this.getFrequencyTimer()
    this.lengthTimer = 64 - this.channelLengthTimerAndDutyRegister.initialLengthTimer
  }

  getSample() {
    const amplitude = this.dutyTable[this.channelLengthTimerAndDutyRegister.waveDuty][this.waveDutyPosition]

    const sampleWithVolume = this.volume !== 0 && this.soundOnRegister.isChannel2On ? amplitude * this.volume :  0.0

    return (sampleWithVolume / 7.5) - 1
  }

  clockLength() {
    if (this.channelFrequencyHighRegister.soundLengthEnable) {
      this.lengthTimer--

      if (this.lengthTimer === 0) {
        this.soundOnRegister.isChannel2On = 0
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

  protected getFrequencyTimer() {
    return (2048 - this.getFrequency()) * 4
  }

  protected getFrequency() {
    return this.channelFrequencyLowRegister.value | (this.channelFrequencyHighRegister.frequencyHighBits << 8)
  }
}