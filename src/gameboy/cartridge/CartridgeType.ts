/**
 * per https://gbdev.io/pandocs/The_Cartridge_Header.html
 */
export enum CartridgeType {
  ROM,
  MBC1,
  MBC1_PLUS_RAM,
  MBC1_PLUS_RAM_PLUS_BATTERY,
  MBC2 = 0x5,
  MBC2_PLUS_BATTERY,
  ROM_PLUS_RAM_1 = 0x8,
  ROM_PLUS_RAM_PLUS_BATTERY_1,
  MM01 = 0xb,
  MM01_PLUS_RAM,
  MMO1_PLUS_RAM_PLUS_BATTERY,
  MBC3_PLUS_TIMER_PLUS_BATTERY = 0xf,
  MBC3_PLUS_TIMER_PLUS_RAM_PLUS_BATTERY_2,
  MBC3,
  MB3_PLUS_RAM_2,
  MBC3_PLUS_RAM_PLUS_BATTERY_2,
  MBC_5 = 0x19,
  MBC5_PLUS_RAM,
  MBC5_PLUS_RAM_PLUS_BATTERY,
  MBC5_PLUS_RUMBLE,
  MB5_PLUS_RUMBLE_PLUS_RAM,
  MBC5_PLUS_RUMBLE_PLUS_RAM_PLUS_BATTERY,
  MBC6 = 0x20,
  MBC7_PLUS_SENSOR_PLUS_RUMBLE_PLUS_RAM_PLUS_BATTERY = 0x22,
  POCKET_CAMERA = 0xfc,
  BANDAI_TAMA5,
  HuC3,
  HuC1_PLUS_RAM_PLUS_BATTERY
}