import { Memory } from "../cpu/Memory"
import { AudioBufferPlayer } from "./AudioBufferPlayer"
import { Channel1 } from "./channels/Channel1"
import { Channel2 } from "./channels/Channel2"
import { Channel3 } from "./channels/Channel3"
import { Channel4 } from "./channels/Channel4"

export class APU {
  private memory: Memory

  private channel1: Channel1
  private channel2: Channel2
  private channel3: Channel3
  private channel4: Channel4

  // https://nightshade256.github.io/2021/03/27/gb-sound-emulation.html
  private readonly frameSequencerCyclesPerStep = 8192

  private frameSequencerStep = 0
  private audioContext = new AudioContext({ sampleRate: 44100 })
  private readonly cpuUperatingHertz = 4194304
  private readonly cyclesPerSample = this.cpuUperatingHertz / 44100

  private sampleCycles = 0
  private frameSequencerCycles = 0

  private audioBufferPlayer: AudioBufferPlayer

  constructor(memory: Memory) {
    this.memory = memory

    this.channel1 = new Channel1(memory)
    this.channel2 = new Channel2(memory)
    this.channel3 = new Channel3(memory)
    this.channel4 = new Channel4(memory)

    this.audioBufferPlayer = new AudioBufferPlayer(this.audioContext)
  }

  tick(cycles: number) {
    this.sampleCycles += cycles
    this.frameSequencerCycles += cycles

    this.channel1.tick(cycles)
    this.channel2.tick(cycles)
    this.channel3.tick(cycles)
    this.channel4.tick(cycles)

    if (this.frameSequencerCycles >= this.frameSequencerCyclesPerStep) {
      this.advanceFrameSequencer()
      this.frameSequencerCycles -= this.frameSequencerCyclesPerStep
    }
    if (this.sampleCycles >= this.cyclesPerSample) {
      this.sampleAudio()
      this.sampleCycles -= this.cyclesPerSample
    }
  }

  // https://nightshade256.github.io/2021/03/27/gb-sound-emulation.html
  // Step   Length Ctr  Vol Env     Sweep
  // ---------------------------------------
  // 0      Clock       -           -
  // 1      -           -           -
  // 2      Clock       -           Clock
  // 3      -           -           -
  // 4      Clock       -           -
  // 5      -           -           -
  // 6      Clock       -           Clock
  // 7      -           Clock       -
  // ---------------------------------------
  // Rate   256 Hz      64 Hz       128 Hz
  advanceFrameSequencer() {
    switch (this.frameSequencerStep) {
      case 0:
        this.clockLength()
        break
      case 2:
        this.clockLength()
        this.clockSweep()
        break
      case 4:
        this.clockLength()
        break
      case 6:
        this.clockLength()
        this.clockSweep()
        break
      case 7:
        this.clockVolume()
        break
    }
    this.frameSequencerStep = (this.frameSequencerStep + 1) % 8
  }

  private sampleAudio() {
    const sample = (this.channel1.getSample() + this.channel2.getSample() + this.channel3.getSample() + this.channel4.getSample()) / 4

    this.audioBufferPlayer.writeSample(sample)
  }

  private clockLength() {
    this.channel1.clockLength()
    this.channel2.clockLength()
    this.channel3.clockLength()
    this.channel4.clockLength()
  }

  private clockSweep() {
    this.channel1.clockSweep()
  }

  private clockVolume() {
    this.channel1.clockVolume()
    this.channel2.clockVolume()
    this.channel4.clockVolume()
  }
}