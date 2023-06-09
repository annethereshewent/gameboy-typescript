export class AudioBufferPlayer {
  private audioContext: AudioContext

  private leftAudioBuffer: SharedArrayBuffer
  private leftAudioData: Float32Array

  private rightAudioBuffer: SharedArrayBuffer
  private rightAudioData: Float32Array

  private readPointer = new Uint32Array(new SharedArrayBuffer(4))
  private writePointer = new Uint32Array(new SharedArrayBuffer(4))

  private leftSamples = new Float32Array(128)
  private rightSamples = new Float32Array(128)

  private sampleIndex = 0

  private audioPlayerNode?: AudioWorkletNode

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext

    this.leftAudioBuffer = new SharedArrayBuffer(128 * Float32Array.BYTES_PER_ELEMENT)
    this.leftAudioData = new Float32Array(this.leftAudioBuffer)

    this.rightAudioBuffer = new SharedArrayBuffer(128 * Float32Array.BYTES_PER_ELEMENT)
    this.rightAudioData = new Float32Array(this.rightAudioBuffer)

    this.addAudioWorklet()
  }

  async addAudioWorklet() {
    await this.audioContext.audioWorklet.addModule("AudioProcessor.js")

    this.audioPlayerNode = new AudioWorkletNode(
      this.audioContext,
      "audio-processor",
      {
        processorOptions: {
          leftAudioData: this.leftAudioData,
          rightAudioData: this.rightAudioData
        }
      }
    )

    this.audioPlayerNode.connect(this.audioContext.destination)
  }

  writeSamples(leftSample: number, rightSample: number) {
    this.leftSamples[this.sampleIndex] = leftSample
    this.rightSamples[this.sampleIndex] = rightSample

    this.sampleIndex++

    // either leftSamples or rightSamples would do here
    if (this.sampleIndex === this.leftAudioData.length) {
      this.copyData(this.leftSamples, this.leftAudioData)
      this.copyData(this.rightSamples, this.rightAudioData)
      this.sampleIndex = 0
    }
  }

  copyData(input: Float32Array, output: Float32Array) {
    for (let i = 0; i < output.length; i++) {
      output[i] = input[i]
    }
  }
}


