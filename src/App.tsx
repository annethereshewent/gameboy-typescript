import './App.scss'
import JSZip from 'jszip'
import { Gameboy } from './gameboy/Gameboy'
function App() {
  const gameboy = new Gameboy()


  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files != null) {
      const file = e.target.files[0]

      let rom: string|ArrayBuffer|undefined|null

      if (file.name.indexOf(".zip") !== -1) {
        // unzip the file first
        const zipFile = await JSZip.loadAsync(file)
        const fileName = Object.keys(zipFile.files)[0]

        rom = await zipFile?.file(fileName)?.async('arraybuffer')
      } else {
        rom = await fileToArrayBuffer(file)
      }

      if (rom != null) {
        gameboy.loadCartridge(rom as ArrayBuffer)

        gameboy.run()

        addNoise()
      }
    }
  }

  let audioContext: AudioContext|null = null

  async function addNoise() {
    audioContext = new AudioContext()
    if (audioContext !== null) {
      await audioContext.resume()
      await audioContext.audioWorklet.addModule("AudioProcessor.js")

      const randomNoiseNode = new AudioWorkletNode(
        audioContext,
        "audio-processor"
      )

      randomNoiseNode.connect(audioContext.destination)
    }
  }

  return (
    <div className="App">
      <div className="gameboy">
        <input type="file" onChange={handleFileChange} />
        <label>Toggle logs</label>
        <input type="checkbox" onChange={(e: React.ChangeEvent<HTMLInputElement>) => Gameboy.shouldOutputLogs = e.target.checked ? true : false} />
        <button type="button" onClick={() => gameboy.isRunning = false}>Stop execution</button>
        <button type="button" onClick={() => addNoise()}>Play noise</button>
        <img id="gameboy-case" alt="gameboy-case" src="/gameboy_transparent.png"></img>
        <canvas width="160" height="144"></canvas>

      </div>
    </div>
  );
}

function fileToArrayBuffer(file: File): Promise<string|ArrayBuffer|null|undefined> {
  const fileReader = new FileReader()

  return new Promise((resolve, reject) => {
    fileReader.onload = () => resolve(fileReader.result)

    fileReader.onerror = () => {
      fileReader.abort()
      reject(new Error("Error parsing file"))
    }

    fileReader.readAsArrayBuffer(file)
  })
}

export default App
