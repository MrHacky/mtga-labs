import * as React from "react";

import { mtgaCollectionState } from "./MtgaCollection"
import { CardDatabase } from "./arena-log-tracker/decoder";

let rarities = [ "common", "uncommon", "rare", "mythic" ];

let sets = [];
const dbStats = (() => {
	let ret = {};
	for (let id in CardDatabase) {
		if (isNaN(parseInt(id)))
			continue;
		let card = CardDatabase[id];
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

function DisplaySetCell(props: { collection, setinfo }) {
    let current = props.collection[1]; // [1] is count including duplicates
    let max     = 4 * props.setinfo;   // so do '4 *'
    return <td title={'test-hint'}>{current}/{max}</td>
}

function DisplaySetLine(props: { name: string, collection, setinfo }) {
    //console.log(props.setinfo);
    //<tr><td>{props.name}</td>{rarities.map(x => <td>{(props.collection[x] || [])[0]}/{props.setinfo[x]}</td>)}</tr>
    return <>
        <tr><td>{props.name}</td>{rarities.map(x => <DisplaySetCell key={x} collection={props.collection[x] || [0, 0]} setinfo={props.setinfo[x]}/>)}</tr>
    </>;
    //return <div>{props.name + ": " + JSON.stringify(props.setinfo) + " | " + JSON.stringify(props.collection)}</div>;name
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
		{globalKeys.map(x => (<div key={x}>
			{x} = {props.collection[x]}
		</div>))}
		Cards: {totalCards}
		<br/>
        <table>
            <tr><th>Name</th>{rarities.map(x => <th key={x}>{x}</th>)}</tr>
            {(sets.map(x => <DisplaySetLine key={x} name={x} collection={cardStats[x] || {}} setinfo={dbStats[x]}/>))}
        </table>
    </div>;
}
