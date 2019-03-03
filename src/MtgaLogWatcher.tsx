import * as React from "react";
import { useState, useEffect, useReducer } from "react";

import { ArenaLogDecoder } from "./arena-log-tracker/decoder";

interface BlobSpec {
	source: File;
	start: number;
	end: number;
}

function BlobToString(blob: BlobSpec): Promise<string> {
	return new Promise<string>(resolve => {
		var reader = new FileReader();

		var timeout = window.setTimeout(function() {
			console.log('timeout')
			reader.onload = null;
			resolve(BlobToString(blob));
		}, 5000);

		reader.onload = () => {
			window.clearTimeout(timeout);
			resolve(reader.result as string); // we use readAsText so .result is a string
		};

		reader.readAsText(blob.source.slice(blob.start, blob.end));
	});
}

function useMonitorFileSize({ file }: { file?: File }) {
	const [ size, setSize ] = useState(0);
	useEffect(() => {
		const id = window.setInterval(() => {
			let newsize = file ? file.size : 0;
			//newsize = Math.min(newsize, size + Math.round(10000 * Math.random()));
			if (file)
				console.log("[" + id + "] size: " + newsize);
			if (file)
				setSize(newsize);
		}, 1000);				
		return () => window.clearInterval(id);
	}, [ file, setSize ]);
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

export function MtgaLogWatcher(props: { onLogEntry }) {
	const [ file, setFile ] = useState<File>(null);
	const size: number = useMonitorFileSize({ file });
	const [ state, setState ] = useState({ curpos: 0, decoder: null, reading: false, appended: false, chunks: [] });

	const [ chunks, setChunks ] = useState([]);
	
	useEffect(() => {
		if (!state.decoder || state.curpos > size) {
			console.log('new decoder');
			setState(prev => ({ ...prev, curpos: 0, decoder: new ArenaLogDecoder() }));
		} else if (state.curpos < size) {
			setState(prev => {
				const chunk: BlobSpec = { source: file, start: prev.curpos, end: size };
				return {
					...prev,
					chunks: [ ...prev.chunks, chunk],
					curpos: size,
				};
			});
		}
	});

	useEffect(() => {
		if (!state.reading && !state.appended && state.chunks.length > 0) {
			setState(prev => {
				if (prev.reading || prev.appended || prev.chunks.length == 0)
					return prev;
				const [ chunk, ...rest ] = prev.chunks;

				BlobToString(chunk).then(result => {
					console.log('append: ' + result.length);
					// abort?
					prev.decoder.append(result, props.onLogEntry);
					setState(prev => ({ ...prev, appended: true }));
				}).catch((e) => console.log('read error' + e));

				return {
					...prev,
					reading: true,
					chunks: rest,
				};
			})
		}
	});

	useEffect(() => {
		if (state.reading && state.appended)
			setState(prev => ({ ...prev, reading: false, appended: false }))
	});
	
	return <div>
		<input type="file" onChange={(e) => setFile(e.target.files[0])}/>
		(Browse to file: %LocalAppData%Low\Wizards Of The Coast\MTGA\output_log.txt)
	</div>;
}

/* WIP: other unfinisged ideas
let decoder = new ArenaLogDecoder();
let curpos = 0;
let size = 0;

const handleContent = (o) => {
	console.log(o.label);
}

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

function useHandleFileChunks() {

}

function reducer(state, action) {
	do {	
		switch (action.type) {
			case 'addChunk': state = { ...state, chunks: [ ...state.chunks, action.chunk ]}; break;
		}
		action = null;

	} while (action);
	return state;
}

	
	useCollectFileChunks({ file, onChunk: (chunk) => {
		setChunks(prev => [ ...prev, chunk ]);
	}});
	
	useEffect(() => {
		let r = decodeLoop();
		return () => r.cancel();
	});

*/
