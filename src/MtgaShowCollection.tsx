import * as React from "react";

import { mtgaCollectionState } from "./MtgaCollection"
import { CardDatabase } from "./arena-log-tracker/decoder";

let sets = [];
const dbStats = (() => {
	let ret = {};
	for (let id in CardDatabase) {
		if (isNaN(parseInt(id)))
			continue;
		let card = CardDatabase[id];
		if (card.name.slice(0, 6) == "Ghalta")
			console.log(card);
		let set = card.set;
		let rarity = card.rarity;
		if (!set)
			console.log(card);
		if (!ret[set]) {
			ret[set] = { common: 0, uncommon: 0, rare: 0, mythic: 0, land: 0, token: 0 }
			sets.push(set);
		}
		ret[set][rarity]++;
	}
	return ret;
})();

function CardsToStats(cards) {
	let stats = {};
	for (let card in cards) {
		let info = CardDatabase[card];
		//console.log(cards[card] + " : " + info.name + ' (' + card + ')');
		let set = info.set;
		let rar = info.rarity;
		if (!stats[set])
			stats[set] = { common: [0,0], uncommon: [0,0], rare: [0,0], mythic: [0,0] };
		stats[set][rar][0] += 1;
		stats[set][rar][1] += cards[card];
	}
	return stats;
}

export function MtgaShowCollection(props: { collection: mtgaCollectionState }) {
	let globalKeys = [];
	for (let key in props.collection)
		if (key != 'cards')
			globalKeys.push(key);
	
	let totalCards = 0;
	for (let card in props.collection.cards)
		totalCards += props.collection.cards[card];

	let cardStats = CardsToStats(props.collection.cards);
	return <div>
		{globalKeys.map(x => (<div>
			{x} = {props.collection[x]}
		</div>))}
		Cards: {totalCards}
		<br/>
		{(sets.map(x => <div>{x + ": " + JSON.stringify(dbStats[x]) + " | " + JSON.stringify(cardStats[x])}</div>))}
	</div>;
}
