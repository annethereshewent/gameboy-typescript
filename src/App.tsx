import React, { useState } from 'react'
import './App.scss'
import JSZip from 'jszip'
import { Gameboy } from './gameboy/Gameboy'
import { CPURegisters } from './gameboy/cpu/CPURegisters'
function App() {
  const [cpuRegisters, setRegisters] = useState<CPURegisters>()
  const gameboy = new Gameboy(setRegisters)


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
      }
    }
  }

  return (
    <div className="App">
      {cpuRegisters != null &&
        (<div className="register-data">
          <p>Register Data:</p>
          <table className="register-table">
            <tbody>
              <tr>
                <td>Register A:</td>
                <td>0x{cpuRegisters.A.value.toString(16)}</td>
              </tr>
              <tr>
                <td>Register B:</td>
                <td>0x{cpuRegisters.B.value.toString(16)}</td>
              </tr>
              <tr>
                <td>Register C:</td>
                <td>0x{cpuRegisters.C.value.toString(16)}</td>
              </tr>
              <tr>
                <td>Register D:</td>
                <td>0x{cpuRegisters.D.value.toString(16)}</td>
              </tr>
              <tr>
                <td>Register E:</td>
                <td>0x{cpuRegisters.E.value.toString(16)}</td>
              </tr>
              <tr>
                <td>Register H:</td>
                <td>0x{cpuRegisters.H.value.toString(16)}</td>
              </tr>
              <tr>
                <td>Register L:</td>
                <td>0x{cpuRegisters.L.value.toString(16)}</td>
              </tr>
              <tr>
                <td>Register SP:</td>
                <td>0x{cpuRegisters.SP.value.toString(16)}</td>
              </tr>
              <tr>
                <td>Register F:</td>
                <td>0x{cpuRegisters.F.value.toString(16)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <div className="gameboy">
        <input type="file" onChange={handleFileChange} />
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
