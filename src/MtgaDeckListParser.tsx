import { CardDatabase } from "./arena-log-tracker/decoder";

export function parseDeckList(DeckString: string) {
	const [ main, side ] = DeckString.trim().split(/\r?\n\s*\r?\n/g);

	const mainlist = main.split(/\r?\n/g).map(x => x.trim()).map(line => {
		let m;
		if (m = line.match(/\b[0-9]+\s*$/))
			line = line.slice(0, m.index).trim();
		if (m = line.match(/\([A-Z0-9]+\)\s*$/))
			line = line.slice(0, m.index).trim();

		m = line.match(/^([0-9]+)\s*(.*)$/);
		return [ +m[1], m[2] ]
	});

	let NameToId = Object.assign({}, ...mainlist.map(x => ({[x[1]]: null})));

	for (let cardid in CardDatabase) {
		const info = CardDatabase[cardid];
		if (NameToId[info.name] === null)
			NameToId[info.name] = cardid;
	}

	return Object.assign({}, ...mainlist.map(x => ({
		[NameToId[x[1]]]: x[0],
	})));
}
