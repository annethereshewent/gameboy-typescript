class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    return false
  }
}

registerProcessor("audio-processor", AudioProcessor)