import { Memory } from "../../cpu/Memory";
import { MemoryRegister } from "../../cpu/memory_registers/MemoryRegister";
import { ChannelFrequencyHighRegister } from "../registers/ChannelFrequencyHighRegister";
import { ChannelLengthTimerAndDutyRegister } from "../registers/ChannelLengthTimerAndDutyRegister";
import { ChannelSweepRegister } from "../registers/ChannelSweepRegister";
import { ChannelVolumeAndEnvelopeRegister } from "../registers/ChannelVolumeAndEnvelopeRegister";
import { Channel2 } from "./Channel2";

/**
 * Channel1 is essentially the same as
 * Channel2, except with a sweep function
 * added
 */
export class Channel1 extends Channel2 {

  sweepEnabled = false
  sweepTimer = 0
  shadowFrequency = 0

  channelSweepRegister: ChannelSweepRegister
  constructor(memory: Memory) {
    super(memory)

    this.channelSweepRegister = new ChannelSweepRegister(memory)
    this.channelLengthTimerAndDutyRegister = new ChannelLengthTimerAndDutyRegister(0xff11, this.memory)
    this.channelVolumeAndEnvelopeRegister = new ChannelVolumeAndEnvelopeRegister(0xff12, this.memory)
    this.channelFrequencyLowRegister = new MemoryRegister(0xff13, this.memory)
    this.channelFrequencyHighRegister = new ChannelFrequencyHighRegister(0xff14, this.memory)
  }

  protected restartSound() {
    this.soundOnRegister.isChannel2On = 1

    this.periodTimer = this.channelVolumeAndEnvelopeRegister.sweepPace
    this.volume = this.channelVolumeAndEnvelopeRegister.initialVolume

    this.frequencyTimer = this.getFrequencyTimer()
    this.lengthTimer = 64 - this.channelLengthTimerAndDutyRegister.initialLengthTimer

    this.sweepTimer = this.channelSweepRegister.sweepPace !== 0 ? this.channelSweepRegister.sweepPace : 8

    if (this.channelSweepRegister.sweepPace > 0 || this.channelSweepRegister.sweepShift > 0) {
      this.sweepEnabled = true
    }

    this.shadowFrequency = this.getFrequency()
  }

  private calculateFrequency() {
    let newFrequency = this.shadowFrequency >> this.channelSweepRegister.sweepShift

    if (this.channelSweepRegister.sweepDirection === 1) {
      newFrequency = this.shadowFrequency + newFrequency
    } else {
      newFrequency = this.shadowFrequency - newFrequency
    }

    if (newFrequency > 2047) {
      this.soundOnRegister.isChannel1On = 0
    }

    return newFrequency
  }

  clockSweep() {
    if (this.sweepTimer > 0) {
      this.sweepTimer--
    }

    if (this.sweepTimer === 0) {
      this.sweepTimer = this.channelSweepRegister.sweepPace !== 0 ? this.channelSweepRegister.sweepPace : 8

      if (this.sweepEnabled && this.sweepTimer > 0) {
        const newFrequency = this.calculateFrequency()

        if (newFrequency < 2047 && this.sweepTimer > 0) {
          this.frequencyTimer = newFrequency
          this.shadowFrequency = newFrequency
        }
      }
    }
  }

}