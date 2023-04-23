import React from 'react'
import './App.css'
import { Gameboy } from 'gameboy-emulator'
import JSZip from 'jszip'


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
        gameboy.loadGame(rom as ArrayBuffer)
        gameboy.apu.enableSound()

        const context = document.querySelector("canvas")?.getContext("2d")
        gameboy.onFrameFinished((imageData: any) => {
          context?.putImageData(imageData, 0, 0)
        })

        gameboy.run()
      }
    }
  }

  return (
    <div className="App">
      <input type="file" onChange={handleFileChange} />
      <canvas width="160" height="144"></canvas>
    </div>
  )
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
