class AudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options)

    this.audioData = options.processorOptions.audioData

    this.writePointer = options.processorOptions.writePointer
    this.readPointer = options.processorOptions.readPointer

    this.interleaved = new Float32Array(128)
  }
  process(inputs, outputs, parameters) {
    this.dequeue(this.interleaved)

    for (var i = 0; i < 128; i++) {
      outputs[0][0][i] = this.interleaved[i]
    }

    return true
  }

  /**
   *
   * credit to https://github.com/roblouie/gameboy-emulator for these methods
   *
   */
  pop(elements) {
    const read = Atomics.load(this.readPointer, 0)
    const write = Atomics.load(this.writePointer, 0)

    const availableToRead = this.availableRead(read, write)

    if (availableToRead === 0) {
      return 0
    }

    const howManyToRead = Math.min(availableToRead, elements.length)
    let sizeUpToEndOfArray = Math.min(this.audioData.length - read, howManyToRead)
    let sizeFromStartOfTheArrayOrZero = howManyToRead - sizeUpToEndOfArray

    this.copy(this.audioData, read, elements, 0, sizeUpToEndOfArray)
    this.copy(this.audioData, 0, elements, sizeUpToEndOfArray, sizeFromStartOfTheArrayOrZero)

    const readPointerPositionAfterRead = (read + howManyToRead) % this.audioData.length
    Atomics.store(this.readPointer, 0, readPointerPositionAfterRead)

    return howManyToRead
  }

  isEmpty() {
    const readPosition = Atomics.load(this.readPointer, 0)
    const writePosition = Atomics.load(this.writePointer, 0)

    return writePosition === readPosition
  }

  dequeue(byteArray) {
    if (this.isEmpty()) {
      return 0
    }
    return this.pop(byteArray)
  }

  availableRead(readPosition, writePosition) {
    if (writePosition > readPosition) {
      return writePosition - readPosition
    } else {
      return writePosition + this.audioData.length - readPosition
    }
  }

  copy(input, inputOffset, output, outputOffset, size) {
    for (let i = 0; i < size; i++) {
      output[outputOffset + i] = input[inputOffset + i]
    }
  }
}

registerProcessor("audio-processor", AudioProcessor)