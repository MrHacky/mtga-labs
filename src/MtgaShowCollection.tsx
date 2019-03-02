import * as React from "react";

import { mtgaCollectionState } from "./MtgaCollection"
import { CardDatabase } from "./arena-log-tracker/decoder";
import { parseDeckList } from "./MtgaDeckListParser";
import * as DeckLists from "./DeckLists";
import ReactTable from 'react-table';
import 'react-table/react-table.css';

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
			ret[set] = { common: 0, uncommon: 0, rare: 0, mythic: 0, land: 0, token: 0, total: 0 }
			sets.push(set);
		}
		ret[set][rarity]++;
		if (rarities.indexOf(rarity) >= 0)
			ret[set].total++;
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
			stats[set] = { common: 0, uncommon: 0, rare: 0, mythic: 0, land: 0, token: 0, total: 0 }
		//stats[set][rar][0] += 1;
		stats[set][rar]  += cards[card];
		stats[set].total += cards[card];
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

function flattenObjects(objlist) {
	return Object.assign({}, ...objlist);
}

function StatsToData(sets, columns, dbStats, cardStats) {
	let data = sets.map(set => ({
		setname: set,
		...flattenObjects(columns.map(rarity => ({
			[rarity]: ((cardStats[set]|| {})[rarity] || 0) + '/' + dbStats[set][rarity] * 4,
		}))),
	}));

	return data;
}

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
				if (!single)
					console.log(info);
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
	let data = StatsToData(sets, [ ...rarities, 'total' ], dbStats, cardStats)
	let missingData = [
		...MissingStatsToData('Mono U'          , MissingDeckStats(parseDeckList(DeckLists.testDeckString1), props.collection.cards)),
		...MissingStatsToData('Mono R - Kiln'   , MissingDeckStats(parseDeckList(DeckLists.testDeckString2), props.collection.cards)),
		...MissingStatsToData('Mono R - Suicide', MissingDeckStats(parseDeckList(DeckLists.testDeckString3), props.collection.cards)),
	];
	let allsets = Object.keys(flattenObjects(missingData.map(x => x.sets)));

	return <div>
		{globalKeys.map(x => (<div key={x}>
			{x} = {props.collection[x]}
		</div>))}
		Cards: {totalCards}
		<br/>
		<ReactTable
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
		<ReactTable
			data={data}
			columns={[
				{ Header: 'Set', accessor: 'setname', width: 200 },
				{ Header: 'Total', accessor: 'total', width: 80 },
				...rarities.map(rarity => ({
					Header: rarity.substr(0, 1).toUpperCase(), accessor: rarity, width: 70
				})),
			]}
			showPagination={false}
			minRows="0"
		/>
	</div>;
}
