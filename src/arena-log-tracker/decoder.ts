import { Settings } from "http2";

export const ArenaLogDecoder = require("../../extern/MTG-Arena-Tool/window_background/arena-log-decoder/arena-log-decoder");
// https://github.com/Manuel-777/MTG-Arena-Tool/raw/7e1c6c6eb505032998c1ee378346f8bfb54e879f/shared/database.js

interface CardData {
    artist: string;
    cid: string; // collection #number within set, seems to really be a number
    cmc: number; // converted mana cost
    collectible: boolean;
    cost: string[]; // list of symbols in mana cost, example: ["1","u","u"]
    craftable: boolean;
    dfc: string; // ?
    dfcId: number; // ?
    frame: number[]; // ?
    images: { small: string, normal: string, large: string, art_crop: string }; // use these strings in url: `https://img.scryfall.com/cards{str}`
    name: string;
    rank: number;
    rarity: string;
    reprints: false | string[]; // strings are actually cardids/numbers
    set: string;
    type: string; // seems to be space separated list
}

export const CardDatabase: { [key: string]: CardData } = require("../../extern/MTG-Arena-Tool/shared/database.json");
