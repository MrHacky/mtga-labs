import * as React from "react";
import * as ReactDOM from "react-dom";

import { useState, useEffect, useReducer } from "react";
import { ArenaLogDecoder, CardDatabase } from "./arena-log-tracker/decoder";

let decoder = new ArenaLogDecoder();
let curpos = 0;
let size = 0;

const handleContent = (o) => {
	console.log(o.label);
}

function BlobToString(blob: Blob): Promise<string> {
	return new Promise<string>(resolve => {
		var reader = new FileReader();
		reader.onload = () => resolve(reader.result as string); // we use readAsText so .result is a string
		reader.readAsText(blob);	
	});
}

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

/*
async function decodeLoop({ file, CheckAbort, handleContent }) {
	let state = {};
	let size = 0;
	while (true) {
		while (size == file.size)
			await Sleep(1000);
		CheckAbort();
		size = file.size;
		if (!state.decoder || state.curpos > size)
			state = { ...state, curpos: 0, decoder: new ArenaLogDecoder()};
		if (state.curpos < size) {
			let chunk = file.slice(prev.curpos, size);
			let data = await BlobToString(chunk);
			state.decoder.append(data, handleContent);
			state.curpos = size;
		}
	}
};

decodeLoop({
	getSize: 
})
*/

function useMonitorFileSize({ file }: { file: File }) {
	const [ size, setSize ] = useState(0);
	useEffect(() => {
		const id = window.setInterval(() => {
			if (file)
				setSize(file.size);
		}, 1000);				
		return () => window.clearInterval(id);
	}, [ file ]);
	return size;
}

function useCollectFileChunks({ file, onChunk }) {
	const size: number = useMonitorFileSize({ file });
	const [ pos, setPos ] = useState(-1);
	useEffect(() => {
		if (pos == -1 || pos > size) {
			setPos(0);
			onChunk(null);
		} else if (pos < size) {
			const chunk = file.slice(pos, size);
			setPos(size);
			onChunk(chunk);
		}
	});
}

function useHandleFileChunks() {

}
/*
function reducer(state, action) {
	do {	
		switch (action.type) {
			case 'addChunk': state = { ...state, chunks: [ ...state.chunks, action.chunk ]}; break;
		}
		action = null;

	} while (action);
	return state;
}
*/

export function LogWatcher(props: { onLogEntry }) {
	const [ file, setFile ] = useState<File>(null);
	const size: number = useMonitorFileSize({ file });
	const [ state, setState ] = useState({ curpos: 0, decoder: null, reader: null, chunks: [] });

	const [ chunks, setChunks ] = useState([]);
	
	/*
	useCollectFileChunks({ file, onChunk: (chunk) => {
		setChunks(prev => [ ...prev, chunk ]);
	}});
	*/
	
	/*
	useEffect(() => {
		let r = decodeLoop();
		return () => r.cancel();
	});
	*/
	
	useEffect(() => {
		if (!state.decoder || state.curpos > size) {
			console.log('new decoder');
			setState(prev => ({ ...prev, curpos: 0, decoder: new ArenaLogDecoder() }));
		} else if (state.curpos < size) {
			setState(prev => {
				const chunk = file.slice(prev.curpos, size);
				return {
					...prev,
					chunks: [ ...prev.chunks, chunk],
					curpos: size,
				};
			});
		}
		if (!state.reader && state.chunks.length > 0) {
			setState(prev => {
				const [ chunk, ...rest ] = prev.chunks;
				return {
					...prev,
					reader: BlobToString(chunk).then(result => {
						// abort?
						prev.decoder.append(result, props.onLogEntry);
						setState(prev => ({ ...prev, reader: null }));					
					}),
					chunks: rest,
				};
			})
		}
		return () => {
			//if (state.reader)
				//state.reader.cancel('x');
		};
	});
	
	return <div>
		<input type="file" onChange={(e) => setFile(e.target.files[0])}/>
		Hello
	</div>;
}

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
		<LogWatcher onLogEntry={mtgaDispatch}></LogWatcher>
		<ShowGlobals state={mtgaState}></ShowGlobals>
	</div>
}

	/*
			size = file.size;
			if (curpos > size) {
				decoder = new ArenaLogDecoder();
				curpos = 0;
			}
			if (curpos < size) {
				const blob = file.slice(curpos, size);
var reader = new FileReader();
reader.onload = function() {
    decoder.append(reader.result, handleContent);
}
reader.readAsText(blob);				
				
			}
		}, 1000);
		return () => window.clearInterval(id);
	});
	*/