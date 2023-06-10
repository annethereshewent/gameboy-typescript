# Gameboy Typescript Emulator

This is a gameboy emulator written in typescript. Currently it plays quite a few Gameboy games (a few have been tested to be working), as well as a few Gameboy color games, with some glitches. Compatibility varies between browsers with Firefox being the most compatible.

## Tested Games

- Megaman - Dr. Wiley's Revenge
- Tetris
- Dr. Mario
- Pokemon Red/Blue
- Donkey Kong
- Frogger
- Pokemon Gold/Silver (with some glitches)
- Zelda: Link's Awakening (DMG version)
- Zelda: Link's Awakening DX
- Pokemon Trading Card Game (with some graphical glitches)
- Super Mario Bros Deluxe
- Super Mario Land
- Super Mario Land 2

## Sound

Sound is working, though in some games sound may be sped up (and also works with varying degrees of success between different browsers.) Currently, Firefox has the best support for audio.

## Controller/Keyboard Support

Controller support varies depending on browser. Controller has been verified to work in Chrome, Firefox (Windows only), and Safari. Keyboard is supported as well across all browsers.

## Usage

This uses a very basic react app to load the gameboy emulator. Install node modules for react by running `yarn install`. To run this you will need https support on your local machine for sound to work properly. To start a local dev server, use `yarn start`, othewise, to build a production build, use `yarn build`.

## Demo

A live demo is available at https://gameboy-typescript.onrender.com. You will need to provide your own roms for testing purposes.
