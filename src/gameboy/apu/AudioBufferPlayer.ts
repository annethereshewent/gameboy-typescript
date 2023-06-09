export class AudioBufferPlayer {
  private audioContext: AudioContext

  private leftAudioBuffer: SharedArrayBuffer
  private leftAudioData: Float32Array

  private rightAudioBuffer: SharedArrayBuffer
  private rightAudioData: Float32Array

  private readPointer = new Uint32Array(new SharedArrayBuffer(4))
  private writePointer = new Uint32Array(new SharedArrayBuffer(4))

  private samples = new Float32Array(1024)

  private sampleIndex = 0

  private audioPlayerNode?: AudioWorkletNode

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext

    this.leftAudioBuffer = new SharedArrayBuffer(this.audioContext.sampleRate / 20 * Float32Array.BYTES_PER_ELEMENT)
    this.leftAudioData = new Float32Array(this.leftAudioBuffer)

    this.rightAudioBuffer = new SharedArrayBuffer(this.audioContext.sampleRate / 20 * Float32Array.BYTES_PER_ELEMENT)
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
          rightAudioData: this.rightAudioData,
          readPointer: this.readPointer,
          writePointer: this.writePointer
        }
      }
    )

    this.audioPlayerNode.connect(this.audioContext.destination)
  }

  writeSample(sample: number) {
    this.samples[this.sampleIndex] = sample

    this.sampleIndex++

    // either leftSamples or rightSamples would do here
    if (this.sampleIndex === this.samples.length) {
      this.push(this.samples)

      this.sampleIndex = 0
    }
  }

  /**
   *
   * credit to https://github.com/roblouie/gameboy-emulator for these methods
   *
   */
  push(elements: Float32Array) {
    const readPosition = Atomics.load(this.readPointer, 0)
    const writePosition = Atomics.load(this.writePointer, 0)

    const availableToWrite = this._availableWrite(readPosition, writePosition)

    if (availableToWrite === 0) {
      return 0
    }

    const howManyToWrite = Math.min(availableToWrite, elements.length)
    const sizeUpToEndOfArray = Math.min(this.leftAudioData.length - writePosition, howManyToWrite)
    const sizeFromStartOfArrayOrZero = howManyToWrite - sizeUpToEndOfArray

    this.copy(elements, 0, this.leftAudioData, writePosition, sizeUpToEndOfArray)
    this.copy(elements, sizeUpToEndOfArray, this.leftAudioData, 0, sizeFromStartOfArrayOrZero)


    const writePointerPositionAfterWrite = (writePosition + howManyToWrite) % this.leftAudioData.length

    Atomics.store(this.writePointer, 0, writePointerPositionAfterWrite)

    return howManyToWrite;
  }

  availableWrite() {
    const readPosition = Atomics.load(this.readPointer, 0)
    const writePosition = Atomics.load(this.writePointer, 0)
    return this._availableWrite(readPosition, writePosition)
  }

  private _availableWrite(readPosition: number, writePosition: number) {
    let distanceToWrite = readPosition - writePosition - 1
    if (writePosition >= readPosition) {
      distanceToWrite += this.leftAudioData.length
    }
    return distanceToWrite
  }

  private copy(input: Float32Array, offsetInput: number, output: Float32Array, offsetOutput: number, size: number) {
    for (let i = 0; i < size; i++) {
      output[offsetOutput + i] = input[offsetInput + i]
    }
  }
}


