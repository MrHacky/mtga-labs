import * as React from "react";
import { useState, useEffect, useReducer } from "react";

import { ArenaLogDecoder } from "./arena-log-tracker/decoder";

function BlobToString(blob: Blob): Promise<string> {
	return new Promise<string>(resolve => {
		var reader = new FileReader();
		reader.onload = () => resolve(reader.result as string); // we use readAsText so .result is a string
		reader.readAsText(blob);	
	});
}

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

export function MtgaLogWatcher(props: { onLogEntry }) {
	const [ file, setFile ] = useState<File>(null);
	const size: number = useMonitorFileSize({ file });
	const [ state, setState ] = useState({ curpos: 0, decoder: null, reader: null, chunks: [] });

	const [ chunks, setChunks ] = useState([]);
	
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
