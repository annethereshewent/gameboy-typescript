import { Memory } from "../cpu/Memory"
import { AudioBufferPlayer } from "./AudioBufferPlayer"
import { Channel1 } from "./channels/Channel1"
import { Channel2 } from "./channels/Channel2"
import { StereoChannel } from "./channels/StereoChannel"

export class APU {
  private memory: Memory

  private channel1: Channel1
  private channel2: Channel2

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

    this.audioBufferPlayer = new AudioBufferPlayer(this.audioContext)
  }

  tick(cycles: number) {
    this.sampleCycles += cycles
    this.frameSequencerCycles += cycles

    this.channel1.tick(cycles)
    this.channel2.tick(cycles)

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
    const channel1LeftSample = this.channel1.getSample(StereoChannel.Left)
    const channel1RightSample = this.channel1.getSample(StereoChannel.Right)

    const channel2LeftSample = this.channel2.getSample(StereoChannel.Left)
    const channel2RightSample = this.channel2.getSample(StereoChannel.Right)

    const channelLeft = (channel1LeftSample + channel2LeftSample) / 4
    const channelRight = (channel1RightSample + channel2RightSample) / 4

    this.audioBufferPlayer.writeSamples(channelLeft, channelRight)
  }

  private clockLength() {
    this.channel1.clockLength()
    this.channel2.clockLength()
  }

  private clockSweep() {
    this.channel1.clockSweep()
  }

  private clockVolume() {
    this.channel1.clockVolume()
    this.channel2.clockVolume()
  }
}