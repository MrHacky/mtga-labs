export class mtgaCollectionState {
	gold = 0;
	gems = 0;
	wcCommon = 0;
	wcUncommon = 0;
	wcRare = 0;
	wcMythic = 0;
	vaultProgress = 0;
	cards: { [id: number]: number } = {};
	//'gold, 'gems', 'wcCommon', 'wcUncommon', 'wcRare', 'wcMythic', 'vaultProgress'
}

export function useMtgaCollectionReducer(state: mtgaCollectionState, action) {
	const o = action;
	if (o.label == "PlayerInventory.GetPlayerCardsV3" && o.arrow == "<==") {
        console.log(o.label);
		let json = o.json();
		for (let card in json)
			state = { ...state, cards: { ...state.cards, [+card]: json[card]}}
	}
	if (o.label == "PlayerInventory.GetPlayerInventory" && o.arrow == "<==") {
        console.log(o.label);
		let json = o.json();
		for (let key in state)
			if (key != 'cards' && json[key] !== undefined)
				state = { ...state, [key]: json[key] };
	}
	if (o.label == "Inventory.Updated") {
        console.log(o.label);
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
