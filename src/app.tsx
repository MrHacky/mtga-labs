import * as React from "react";
import * as ReactDOM from "react-dom";

import { useState, useEffect, useReducer } from "react";
import { CardDatabase } from "./arena-log-tracker/decoder";

import { MtgaLogWatcher } from "./MtgaLogWatcher";

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

class mtgaCollectionState {
	gold = 0;
	gems = 0;
	wcCommon = 0;
	wcUncommon = 0;
	wcRare = 0;
	wcMythic = 0;
	vaultProgress = 0;
	cards = {};
	//'gold, 'gems', 'wcCommon', 'wcUncommon', 'wcRare', 'wcMythic', 'vaultProgress'
}

function mtgaReducer(state: mtgaCollectionState, action) {
	const o = action;
	if (o.label == "PlayerInventory.GetPlayerCardsV3" && o.arrow == "<==") {
		let json = o.json();
		for (let card in json)
			state = { ...state, cards: { ...state.cards, [+card]: json[card]}}
	}
	if (o.label == "PlayerInventory.GetPlayerInventory" && o.arrow == "<==") {
		let json = o.json();
		for (let key in state)
			if (key != 'cards' && json[key] !== undefined)
				state = { ...state, [key]: json[key] };
	}
	if (o.label == "Inventory.Updated") {
		let json = o.json();
		for (let key in state)
			if (key != 'cards' && json[key] !== undefined)
				state = { ...state, [key]: state[key] + json.delta[key + 'Delta'] };
		for (let card of json.delta.cardsAdded)
			state = { ...state, cards: { ...state.cards, [+card]: (state.cards[card] || 0) + 1} };
	}
	//console.log(state);
	return state;
}

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

function ShowGlobals(props: { state: mtgaCollectionState }) {
	let globalKeys = [];
	for (let key in props.state)
		if (key != 'cards')
			globalKeys.push(key);
	
	let totalCards = 0;
	for (let card in props.state.cards)
		totalCards += props.state.cards[card];

	let cardStats = CardsToStats(props.state.cards);
	return <div>
		{globalKeys.map(x => (<div>
			{x} = {props.state[x]}
		</div>))}
		Cards: {totalCards}
		<br/>
		{JSON.stringify(props.state.cards)}
		<br/>
		{(sets.map(x => <div>{x + ": " + JSON.stringify(dbStats[x]) + " | " + JSON.stringify(cardStats[x])}</div>))}
	</div>;
}

export function App(props: {  }) {
	const [ mtgaState, mtgaDispatch ] = useReducer(mtgaReducer, new mtgaCollectionState());
	return <div>
		<MtgaLogWatcher onLogEntry={mtgaDispatch}></MtgaLogWatcher>
		<ShowGlobals state={mtgaState}></ShowGlobals>
	</div>
}
