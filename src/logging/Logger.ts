class Logger {
  loggedString = ""
  blob = new Blob([], { type: "text/plain" })

  chunks: string[] = []

  log(str: string) {
    this.loggedString += str

    if (this.loggedString.length > 1024) {
      this.chunks.push(this.loggedString)
      this.loggedString = ""
    }
  }

  outputFile() {
    const link = document.createElement('a')

    link.download = "gameboy.log"

    link.href = URL.createObjectURL(new Blob(this.chunks, { type: "text/plain"}))

    link.click()
  }
}

export const logger = new Logger()