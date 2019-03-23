import * as React from "react";

import { mtgaCollectionState } from "./MtgaCollection"
import { CardDatabase, sets, rarities, dbStats } from "./arena-log-tracker/database";
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { flattenObjects } from "./util";


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

function StatsToData(sets, columns, dbStats, cardStats) {
	let data = sets.map(set => ({
		setname: set,
		...flattenObjects(columns.map(rarity => ({
			[rarity]: ((cardStats[set]|| {})[rarity] || 0) + '/' + dbStats[set][rarity] * 4,
		}))),
	}));

	return data;
}

export function MtgaShowCollection(props: { collection: mtgaCollectionState }) {
	let totalCards = 0;
	for (let card in props.collection.cards)
		totalCards += props.collection.cards[card];

	let cardStats = CardsToStats(props.collection.cards);
	let data = StatsToData(sets, [ ...rarities, 'total' ], dbStats, cardStats)

	return <ReactTable
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
	/>;
}
