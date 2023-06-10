import './App.scss'
import JSZip from 'jszip'
import { Gameboy } from './gameboy/Gameboy'
function App() {
  let gameboy: Gameboy|null = null

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    gameboy = new Gameboy()
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
      }
    }
  }

  function loadRom() {
    document.getElementById("rom-input")?.click()
  }

  function enterFullScreen() {
    document.documentElement.requestFullscreen()
  }


  return (
    <div className="App">
      <button className="full-screen" onClick={enterFullScreen}>Full screen</button>
      <div className="gameboy">
        <div className="load-game">
          <img id="load-icon" src="/load_button_white.png" alt="load game" onClick={loadRom} />
        </div>
        <input id="rom-input" type="file" style={{ display: 'none' }} onChange={handleFileChange} />
        {/* <label>Toggle logs</label>
        <input type="checkbox" onChange={(e: React.ChangeEvent<HTMLInputElement>) => Gameboy.shouldOutputLogs = e.target.checked ? true : false} />
        <button type="button" onClick={() => {
            if (gameboy != null) {
              gameboy.isRunning = false
            }
          }
        }>
          Stop execution
        </button> */}
        <img id="gameboy-case" alt="gameboy-case" src="/gameboy_transparent.png"></img>
        <canvas width="160" height="144"></canvas>
      </div>
      <div className="controls">
        <h2>CONTROLS:</h2>

        <h3>Keyboard:</h3>
        <ul>
          <li><label>D-Pad:</label> Arrow keys</li>
          <li><label>A button:</label> S key</li>
          <li><label>B button:</label> A key</li>
          <li><label>Select:</label> Tab</li>
          <li><label>Start:</label> Enter</li>
        </ul>
        <h3>Xbox 360 Controller:</h3>
        <ul>
          <li><label>D-Pad:</label> D-pad or left thumb stick</li>
          <li><label>A button:</label> A button</li>
          <li><label>B button:</label> X button</li>
          <li><label>Start:</label> Start</li>
          <li><label>Select:</label> Select</li>
        </ul>
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
