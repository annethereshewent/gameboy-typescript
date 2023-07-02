import './App.scss'
import './mui.min.css'
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

  function showControlsModal() {
    const modal = document.getElementById("modal")

    if (modal != null) {
      modal.style.display = "block"
    }
  }

  function hideControlsModal() {
    const modal = document.getElementById("modal")

    if (modal != null) {
      modal.style.display = "none"
    }
  }

  return (
    <div>
      <div className="app-bar">
        <div className="buttons">
        <button className="mui-btn mui-btn--primary mui-btn--raised" onClick={loadRom}>Load Game</button>
        <button className="mui-btn mui-btn--accent mui-btn--raised" onClick={showControlsModal}>Help</button>
        <button id="full-screen" className="mui-btn mui-btn--danger mui-btn--raised" onClick={enterFullScreen}>Full Screen</button>
        </div>
      </div>

      <div className="gameboy">
        <input id="rom-input" type="file" style={{ display: 'none' }} onChange={handleFileChange} />
        <canvas width="160" height="144"></canvas>
      </div>
      <div id="modal">
        <div className="controls">
          <span className="close" onClick={hideControlsModal}>&times;</span>
          <h2>CONTROLS</h2>
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
          <p>Emulator written by <a href="https://www.github.com/annethereshewent">annethereshewent</a></p>
        </div>
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
