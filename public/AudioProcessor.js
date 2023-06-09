class AudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options)

    this.leftAudioData = options.processorOptions.leftAudioData
    this.rightAudioData = options.processorOptions.rightAudioData
  }
  process(inputs, outputs, parameters) {
    for (var i = 0; i < 128; i++) {
      outputs[0][0][i] = this.leftAudioData[i]
    }
    return true
  }
}

registerProcessor("audio-processor", AudioProcessor)