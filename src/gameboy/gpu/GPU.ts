import { Memory } from "../cpu/Memory"
import { InterruptRequestRegister } from "../cpu/memory_registers/InterruptRequestRegister"
import { GPURegisters } from "./registers/GPURegisters"
import { LCDMode } from "./registers/lcd_status/LCDMode"


// see http://imrannazar.com/GameBoy-Emulation-in-JavaScript:-GPU-Timings
const CYCLES_IN_HBLANK = 204
const CYCLES_IN_OAM = 80
const CYCLES_IN_VRAM = 172

const CYCLES_PER_SCANLINE = CYCLES_IN_HBLANK + CYCLES_IN_OAM + CYCLES_IN_VRAM
const CYCLES_IN_VBLANK = 4560

const SCANLINES_PER_FRAME = 144

export class GPU {
  static screenWidth = 160
  static screenHeight = 144
  static offscreenHeight = 154

  static CyclesPerFrame = (CYCLES_PER_SCANLINE * SCANLINES_PER_FRAME) + CYCLES_IN_VBLANK

  cycles = 0

  // color is determined by the palette registers
  colors = [
    // black
    { red: 0, green: 0, blue: 0 },
    // gray
    { red: 96, green: 96, blue: 96 },
     // light grey
     { red: 192, green: 192, blue: 192 },
    // white
    { red: 255, green: 255, blue: 255 },
  ]

  memory: Memory
  registers: GPURegisters

  screen = new ImageData(GPU.screenWidth, GPU.screenHeight)

  constructor(memory: Memory) {
    this.memory = memory
    this.registers = new GPURegisters(memory)
  }

  step(cycles: number) {
    const interruptRequestRegister = new InterruptRequestRegister(this.memory)

    this.cycles += cycles
    switch (this.registers.lcdStatusRegister.mode) {
      case LCDMode.HBlank:
        if (this.cycles >= CYCLES_IN_HBLANK) {
          this.drawLine()
          this.registers.lineYRegister.value++

          if (this.registers.lineYRegister.value === GPU.screenHeight) {
            this.registers.lcdStatusRegister.mode = LCDMode.VBlank

            interruptRequestRegister.triggerVBlankRequest()
          } else {
            this.registers.lcdStatusRegister.mode = LCDMode.SearchingOAM
          }

          this.cycles %= CYCLES_IN_HBLANK
        }
        break
      case LCDMode.VBlank:
        if (this.cycles >= CYCLES_PER_SCANLINE) {
          this.registers.lcdStatusRegister.lineYCompareMatching = this.registers.lineYCompareRegister.value === this.registers.lineYRegister.value ? 1 : 0

          if (this.registers.lcdStatusRegister.isLineYCompareMatching() && this.registers.lcdStatusRegister.isLineYMatchingInerruptSelected()) {
            interruptRequestRegister.triggerLcdStatRequest()
          }

          this.registers.lineYRegister.value++

          if (this.registers.lineYRegister.value === GPU.offscreenHeight) {
            this.registers.lcdStatusRegister.mode = LCDMode.SearchingOAM
            this.registers.lineYRegister.value = 0
          }

          this.cycles %= CYCLES_PER_SCANLINE
        }

        break
      case LCDMode.SearchingOAM:
        if (this.cycles >= CYCLES_IN_OAM) {
          this.registers.lcdStatusRegister.mode = LCDMode.TransferringToLCD

          this.cycles %= CYCLES_IN_OAM
        }
        break
      case LCDMode.TransferringToLCD:
        if (this.cycles >= CYCLES_IN_VRAM) {
          if (this.registers.lcdStatusRegister.isHBlankInterruptSelected()) {
            interruptRequestRegister.triggerLcdStatRequest()
          }

          this.registers.lcdStatusRegister.lineYCompareMatching = this.registers.lineYCompareRegister.value === this.registers.lineYRegister.value ? 1 : 0

          if (this.registers.lcdStatusRegister.isLineYCompareMatching() && this.registers.lcdStatusRegister.isLineYCompareMatching()) {
            interruptRequestRegister.triggerLcdStatRequest()
          }

          this.registers.lcdStatusRegister.mode = LCDMode.HBlank

          this.cycles %= CYCLES_IN_VRAM
        }
        break
    }
  }

  drawLine() {
    const { lcdControlRegister } = this.registers
    if (lcdControlRegister.isLCDControllerOn()) {
      return
    }

    if (lcdControlRegister.isBackgroundOn()) {
      this.drawBackgroundLine2()
    }

    if (lcdControlRegister.isWindowOn()) {
      this.drawWindowLine()
    }

    if (lcdControlRegister.isObjOn()) {
      this.drawSpriteLine()
    }
  }

  drawSpriteLine() {

  }

  drawBackgroundLine2() {
    const backgroundLineValues = [];
    const bytesPerCharacter = 2;
    const characterDataStartAddress = this.registers.lcdControlRegister.bgAndWindowTileDataArea();

    //const { bgTileMapArea, bgAndWindowTileDataArea } = this.registers.lcdControlRegister;
    const memoryReadMethod = (address: number) => this.registers.lcdControlRegister.bgAndWindowTileDataArea() === 0x8800 ? this.memory.readSignedByte(address) : this.memory.readByte(address)

    const palette = this.registers.backgroundPaletteRegister.colors

    const scrolledY = this.registers.lineYRegister.value + this.registers.scrollYRegister.value & 0xff

    for (let screenX = 0; screenX < GPU.screenWidth; screenX++) {
      // If background off, write color 0 to background, should probably be
      // refactored to avoid if/else with drawing
      if (!this.registers.lcdControlRegister.isBackgroundOn()) {
        const paletteColor = palette[0];
        const color = this.colors[paletteColor];
        backgroundLineValues.push(0);
        this.drawPixel(screenX, this.registers.lineYRegister.value, color.red, color.green, color.blue);
      } else {
        const scrolledX = screenX + this.registers.scrollXRegister.value & 0xff
        const tileMapIndex = this.getTileIndexFromPixelLocation(scrolledX, scrolledY);
        const tilePixelPosition = this.getUpperLeftPixelLocationOfTile(tileMapIndex);

        const xPosInTile = scrolledX - tilePixelPosition.x;
        const yPosInTile = scrolledY - tilePixelPosition.y;

        const bytePositionInTile = yPosInTile * bytesPerCharacter;

        const relativeOffset = this.registers.lcdControlRegister.bgAndWindowTileDataArea() === 0x8800 ? 128 : 0;
        const tileCharIndex = memoryReadMethod(this.registers.lcdControlRegister.bgTileMapArea() + tileMapIndex) + relativeOffset;
        const tileCharBytePosition = tileCharIndex * 16; // 16 bytes per tile

        const currentTileLineBytePosition = characterDataStartAddress + tileCharBytePosition + bytePositionInTile;
        const lowerByte = this.memory.readByte(currentTileLineBytePosition);
        const higherByte = this.memory.readByte(currentTileLineBytePosition + 1);

        const paletteIndex = this.getPixelInTileLine(xPosInTile, lowerByte, higherByte, false);
        backgroundLineValues.push(paletteIndex);

        const paletteColor = palette[paletteIndex];
        const color = this.colors[paletteColor];

        this.drawPixel(screenX, this.registers.lineYRegister.value, color.red, color.green, color.blue);
      }
    }

    return backgroundLineValues;
  }

  drawBackgroundLine() {
    const tileSize = 8 // tile size is 8x8 pixels
    const numberOfTilesPerSide = 32 // tile map is 32 x 32 tiles

    const yPosition = (this.registers.scrollYRegister.value + this.registers.lineYRegister.value) & 0xff

    const tileDataStartAddress = this.registers.lcdControlRegister.bgAndWindowTileDataArea()
    const tileMapAddress = this.registers.lcdControlRegister.bgTileMapArea()

    const paletteColors = this.registers.backgroundPaletteRegister.colors

    // tile maps that start at 0x8000 use unsigned address, those that start at 0x8800 use signed addressing
    const memoryRead = (byteAddress: number) => tileDataStartAddress === 0x8000 ? this.memory.readByte(byteAddress) : this.memory.readSignedByte(byteAddress)

    for (let i = 0; i < GPU.screenWidth; i++) {
      const xPosition = (i + this.registers.scrollXRegister.value) & 0xff

      //
      const tileIndex = (Math.floor(yPosition / tileSize) * numberOfTilesPerSide) + Math.floor(xPosition / tileSize)

      // these are the upper left pixel coordinates for the tile
      const posY = (Math.floor(tileIndex / numberOfTilesPerSide)) * tileSize
      const posX = (tileIndex - posY * numberOfTilesPerSide) * tileSize

      const offsetPosX = this.registers.scrollXRegister.value - posX
      const offsetPosY = this.registers.scrollYRegister.value - posY

      // in order to get the tile palette color, we need to get the lower and upper bytes, hence the 2
      const bytePosition = offsetPosY * 2

      // per https://gbdev.io/pandocs/Tile_Data.html#vram-tile-data, address offset starts at 128
      // if bit 4 in lcd control register (bgAndWindowTileDataArea) == 1, otherwise 0
      const addressOffset = tileDataStartAddress === 0x8800 ? 128 : 0
      const tileMapPointer = memoryRead(tileMapAddress + tileIndex) + addressOffset

      const tileCharBytePos = tileMapPointer * 16

      const currentTileLineBytePosition = tileDataStartAddress + tileCharBytePos + bytePosition

      const lowerByte = this.memory.readByte(currentTileLineBytePosition)
      const upperByte = this.memory.readByte(currentTileLineBytePosition + 1)

      const colorIndex = paletteColors[this.getPixelColorIndex(offsetPosX, lowerByte, upperByte)]

      const color = this.colors[colorIndex]
      // finally draw the pixel!
      this.drawPixel(i, this.registers.lineYRegister.value, color.red, color.green, color.blue)
    }
  }

  getPixelColorIndex(posX: number, lowerByte: number, upperByte: number) {
    // now  start at bit 7 and move backwards and read the bit from the lowerByte and the upperByte and add them together.
      // this will give the palette color to use for the pixel.
    const bitPosition = 7 - posX

    const lowerBit = (lowerByte >> bitPosition) & 1
    const upperBit = ((upperByte >> bitPosition) & 1) << 1

    return lowerBit + upperBit
  }

  drawWindowLine() {

  }

  drawPixel(x: number, y: number, r: number, g: number, b: number, alpha: number = 0xff) {
    const pos = (x * 4) + (y * this.screen.width * 4)

    this.screen.data[pos] = r
    this.screen.data[pos + 1] = g
    this.screen.data[pos + 2] = b
    this.screen.data[pos + 3] = alpha
  }

  private getTileIndexFromPixelLocation(x: number, y: number) {
    const tileSize = 8;
    const backgroundNumberOfTilesPerSide = 32;

    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);

    return (tileY * backgroundNumberOfTilesPerSide) + tileX;
  }

  private getUpperLeftPixelLocationOfTile(tile: number) {
    const tileSize = 8;
    const backgroundNumberOfTilesPerSide = 32;

    const posY = Math.floor(tile / backgroundNumberOfTilesPerSide);
    const posX = tile - posY * backgroundNumberOfTilesPerSide;

    return { x: posX * tileSize, y: posY * tileSize };
  }

  private getPixelInTileLine(xPosition: number, lowerByte: number, higherByte: number, isFlippedX: boolean) {
    // the pixel at position 0 in a byte is the rightmost pixel, but when drawing on canvas, we
    // go from left to right, so 0 is the leftmost pixel. By subtracting 7 (the last index in the byte)
    // we can effectively swap the order.
    const xPixelInTile = isFlippedX ? xPosition : 7 - xPosition;
    const shadeLower = this.getBit(lowerByte, xPixelInTile);
    const shadeHigher = this.getBit(higherByte, xPixelInTile) << 1;

    return shadeLower + shadeHigher;
  }

  getBit(value: number, pos: number): number {
    return (value >> pos) & 1
  }
}