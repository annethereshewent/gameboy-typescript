class AudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options)

    this.leftAudioData = options.processorOptions.leftAudioData
    this.rightAudioData = options.processorOptions.rightAudioData

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

  pop(elements) {
    const read = Atomics.load(this.readPointer, 0);
    const write = Atomics.load(this.writePointer, 0);

    const availableToRead = this.availableRead(read, write);

    if (availableToRead === 0) {
      return 0;
    }

    // Allows circular writing to array. Usually only the first call to copy is called, but if we are near the end
    // of the array, the first copy writes up to the end, then the seczond copy writes the remainder at the start
    const howManyToRead = Math.min(availableToRead, elements.length);
    let sizeUpToEndOfArray = Math.min(this.leftAudioData.length - read, howManyToRead);
    let sizeFromStartOfTheArrayOrZero = howManyToRead - sizeUpToEndOfArray;

    this.copy(this.leftAudioData, read, elements, 0, sizeUpToEndOfArray);
    this.copy(this.leftAudioData, 0, elements, sizeUpToEndOfArray, sizeFromStartOfTheArrayOrZero);

    const readPointerPositionAfterRead = (read + howManyToRead) % this.leftAudioData.length;
    Atomics.store(this.readPointer, 0, readPointerPositionAfterRead);

    return howManyToRead;
  }

  isEmpty() {
    const readPosition = Atomics.load(this.readPointer, 0);
    const writePosition = Atomics.load(this.writePointer, 0);

    return writePosition === readPosition;
  }

  dequeue(byteArray) {
    if (this.isEmpty()) {
      return 0;
    }
    return this.pop(byteArray);
  }

  availableRead(readPosition, writePosition) {
    if (writePosition > readPosition) {
      return writePosition - readPosition;
    } else {
      return writePosition + this.leftAudioData.length - readPosition;
    }
  }

  copy(input, inputOffset, output, outputOffset, size) {
    for (let i = 0; i < size; i++) {
      output[outputOffset + i] = input[inputOffset + i];
    }
  }
}

registerProcessor("audio-processor", AudioProcessor)