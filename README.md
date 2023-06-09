This is a gameboy emulator written in typescript. Currently it plays most Gameboy games (a few have been tested to be working), as well as a few Gameboy color games, with some glitches.

## Supported Games

- Megaman - Dr. Wiley's Revenge
- Tetris
- Dr. Mario
- Pokemon Red/Blue
- Donkey Kong
- Frogger
- Pokemon Gold/Silver (with some glitches)
- Zelda: Link's Awakening (DMG version)
- Pokemon Trading Card Game (with some graphical glitches)
- Super Mario Bros Deluxe
- Super Mario Land

## Sound

Sound is working, though in some games sound may be sped up (and also works with varying degrees of success between different browsers.) Currently, Firefox has the best support for audio.

## Controller/Keyboard Support

Controller support is implemented in Chrome and Safari. Controller support does not work as well in Firefox, but keyboard support works across all browsers.

## Usage

This uses a very basic react app to load the gameboy emulator. Install node modules for react by running `yarn install`. To run this you will need https support on your local machine for sound to work properly. To start a local dev server, use `yarn start`, othewise, to build a production build, use `yarn build`.

