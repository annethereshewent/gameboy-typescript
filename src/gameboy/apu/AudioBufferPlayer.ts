export class AudioBufferPlayer {
  private audioContext: AudioContext

  private readonly sampleBufferLength = 1024

  private audioBuffer: SharedArrayBuffer
  private audioData: Float32Array
  private readPointer = new Uint32Array(new SharedArrayBuffer(4))
  private writePointer = new Uint32Array(new SharedArrayBuffer(4))

  private leftSamples = new Float32Array(1024)
  private rightSamples = new Float32Array(1024)

  private sampleIndex = 0

  private audioPlayerNode?: AudioWorkletNode

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext

    this.audioBuffer = new SharedArrayBuffer(this.audioContext.sampleRate / 20 * Float32Array.BYTES_PER_ELEMENT)
    this.audioData = new Float32Array(this.audioBuffer)

    this.addAudioWorklet()
  }

  async addAudioWorklet() {
    await this.audioContext.audioWorklet.addModule("AudioProcessor.js")

    this.audioPlayerNode = new AudioWorkletNode(
      this.audioContext,
      "audio-processor",
      {
        processorOptions: {
          audioData: this.audioData,
          readPointer: this.readPointer,
          writePointer: this.writePointer
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
    if (this.sampleIndex === this.leftSamples.length) {


      this.sampleIndex = 0
    }
  }
}