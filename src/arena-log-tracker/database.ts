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
