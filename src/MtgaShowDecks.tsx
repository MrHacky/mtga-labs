import * as React from "react";

import { mtgaCollectionState } from "./MtgaCollection"
import { CardDatabase, sets, rarities, dbStats } from "./arena-log-tracker/database";
import { parseDeckList } from "./MtgaDeckListParser";
import * as DeckLists from "./DeckLists";
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import styled from "./themed-components";
import { flattenObjects } from "./util";

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
				name: name + (single ? '' : '+'),
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

export function MtgaShowDecks(props: { collection: mtgaCollectionState }) {
	let missingData = [
		...MissingStatsToData('Mono U'          , MissingDeckStats(parseDeckList(DeckLists.testDeckString1), props.collection.cards)),
		...MissingStatsToData('Mono W'          , MissingDeckStats(parseDeckList(DeckLists.testDeckString4), props.collection.cards)),
		...MissingStatsToData('Mono R - Kiln'   , MissingDeckStats(parseDeckList(DeckLists.testDeckString2), props.collection.cards)),
		...MissingStatsToData('Mono R - Suicide', MissingDeckStats(parseDeckList(DeckLists.testDeckString3), props.collection.cards)),
	];
	let allsets = Object.keys(flattenObjects(missingData.map(x => x.sets)));

	return <ReactTable
		data={missingData}
		columns={[
			{ Header: 'Name', accessor: 'name', width: 200 },
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
}
