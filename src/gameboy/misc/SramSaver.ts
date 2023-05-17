export class SramSaver {
  static saveFile(name: string, sram: Uint8Array) {
    const jsonArray = Array.from(sram)

    localStorage.setItem(`${name}.sav`, JSON.stringify(jsonArray))
  }

  static loadFile(name: string): Uint8Array|null {
    const json = localStorage.getItem(`${name}.sav`)

    if (json != null) {
      const jsonArray = JSON.parse(json)

      return new Uint8Array(jsonArray)
    }

    return null
  }
}