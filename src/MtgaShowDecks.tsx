import * as React from "react";

import { useState } from "react";
import { mtgaCollectionState } from "./MtgaCollection"
import { CardDatabase, sets, rarities, dbStats } from "./arena-log-tracker/database";
import { parseDeckList } from "./MtgaDeckListParser";
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import styled from "./themed-components";
import { flattenObjects, objectMap } from "./util";
import { GoogleStorageApi } from "./persistent-storage/storage";
import { usePersistCollectionState } from "./usePersistCollectionState";

const CollectionWrapper = styled.div`
	grid-area: collection;
`;

function MissingDeckStats(deck, cards) {
	let result = [];
	for (let cardid in deck) {
		let info = CardDatabase[cardid];
		let need = deck[cardid];
		let owned = cards[cardid] || 0;
		let cardids = [ cardid ];
		for (let o of (info.reprints || [])) {
			owned += (cards[o] || 0);
			cardids.push(o);
			sets[CardDatabase[o].set + "::" + CardDatabase[o].rarity] = o;
		}

		if (owned < need && info.rarity != 'land') {
			result.push({
				ids: cardids,
				count: need - owned,
			});
		}
		//console.log((owned < need && info.rarity != 'land') + ":" + info.name + ":" + owned + "/" + need + ":" + sets.map(x => x.set + '-' + x.rarity).join());
	}
	return result;
}

function MissingStatsToData(name, missing) {
	// Sort by set, sort by set + rarity, totals, totals by rarity
	// singleset+multiset combined, singleset+multiset separate line?
	// count as 1 or not
	try {
		return [true, false].map(single  => {
			let total = { total: 0, common: 0, uncommon: 0, rare: 0, mythic: 0 };
			let sets = {};
			for (let miss of missing) {
				if ((miss.ids.length == 1) != single)
					continue;
				let lowestrarity = null;
				for (let cardid of miss.ids) {
					let info = CardDatabase[cardid];
					let set = info.set;
					if (!sets[set])
						sets[set] = { total: 0, common: 0, uncommon: 0, rare: 0, mythic: 0 };
					let rarity = info.rarity;
					let diff = 1;
					sets[set]['total'] += diff;
					sets[set][rarity]  += diff;
					if (!lowestrarity || rarities.indexOf(lowestrarity) > rarities.indexOf(rarity))
						lowestrarity = rarity;
				}
				let diff = miss.count;
				total['total']      += diff;
				total[lowestrarity] += diff;
			}

			return {
				name,
				single,
				total,
				sets,
			};
		});
	} catch (e) {
		console.log("Invalid deck?");
		console.log(e);
		return [];
	}
}

export function MtgaShowDecks(props: { collection: mtgaCollectionState, gapi: GoogleStorageApi }) {
	const [ decklists, setDecklists ] = useState({});
	usePersistCollectionState({
		gapi: props.gapi,
		filename: 'mtga-labs-decklists.json',
		collectionState: decklists,
		setCollectionState: setDecklists,
	});

	let deckStats = objectMap(decklists, (deck) => MissingDeckStats(parseDeckList(deck), props.collection.cards));
	let missingData = [].concat(...Object.keys(deckStats)
		.map(name => MissingStatsToData(name, deckStats[name]))
	);

	let allsets = Object.keys(flattenObjects(missingData.map(x => x.sets)));

	let [ editDeckName, setEditDeckName ] = useState("");
	let [ editDeckList, setEditDeckList ] = useState("");

	function addDeck() {
		if (editDeckName && editDeckList) {
			setDecklists(prev => ({
				...prev,
				[editDeckName]: editDeckList,
			}));
		}
		setEditDeckName("");
		setEditDeckList("");
	};

	function editDeck(deckname) {
		setEditDeckName(deckname);
		setEditDeckList(decklists[deckname]);
	}

	return <>
		<button onClick={addDeck}>Save deck</button>
		Name: <input    type="text" value={editDeckName} onChange={(e) => setEditDeckName(e.target.value)}/>
		{ editDeckName && <>
			<br/>
			Decklist: (Paste 'magic arena' export from the game or from sites like mtggoldfish.com)
			<br/>
			<textarea rows={20} cols={50} value={editDeckList} onChange={(e) => setEditDeckList(e.target.value)}/>
		</>}
		<ReactTable
			data={missingData}
			columns={[
				{ Header: 'Name', id: 'deckname', width: 200, accessor: row => <>
					{row.name} {row.single
						? <span onClick={() => editDeck(row.name)} style={{color: "blue", "text-decoration": "underline"}}>edit</span>
						: "(multiset)"
					}
				</> },
				{ Header: 'Totals', columns: [
					{ Header: '*', accessor: 'total.total', width: 30 },
					...rarities.map(rarity => ({
						Header: rarity.substr(0, 1).toUpperCase(), accessor: 'total.' + rarity, width: 30
					})),
				]},
				...allsets.map(set => ({
					Header: set, columns: [
						{ Header: '', accessor: () => '', id: 'spacer->' + set, width: 20 },
						//{ Header: '*', accessor: row => row.sets[set].total, id: 'total->' + set, width: 30 },
						...rarities.map(rarity => ({
							Header: rarity.substr(0, 1).toUpperCase() , accessor: row => row.sets[set] ? row.sets[set][rarity] : '-', width: 30, id: rarity + '->' + set
						})),
					],
				})),
			]}
			showPagination={false}
			minRows="0"
		/>
	</>;
}
