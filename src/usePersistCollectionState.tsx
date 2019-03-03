import { useState, useEffect, useReducer } from "react";

import { useGoogleApi } from "./persistent-storage/storage";

async function doInitCollectionFile(gapi) {
	let fileid = "";
	let files = await gapi.queryFileList("'root' in parents and trashed = false and title = 'mtga-labs-collection.json'");
	if (files.length == 0) {
		let create: { id: string } = await gapi.createFile('mtga-labs-collection.json', '{}');
		fileid = create.id;
	} else if (files.length == 1) {
		fileid = files[0].id;
	} else
		throw new Error("Multiple files?");

	let content = await gapi.retrieveContent(fileid);
	return [ fileid, JSON.parse(content.body) ];
}

export function usePersistCollectionState({ collectionState, setCollectionState }): [string, (state: any) => void] {
	let gapi = useGoogleApi();
	let [ promise, setPromise ] = useState(null);
	let [ fileId, setFileId ] = useState(null);
	let [ savedState, setSavedState ] = useState({});

	useEffect(() => {
		console.log('effect:' + gapi.state);
		if (gapi.state == 'out') {
			console.log('signin');
			gapi.signin();
		}
		if (gapi.state == 'in' && !promise) {
			setPromise(doInitCollectionFile(gapi).then(([ id, content ]) => {
				setCollectionState(content);
				setSavedState(content);
				setFileId(id);
			}));
		}
	}, [ gapi.state, promise ]);

	async function saveCollectionState(): Promise<void> {
		if (!fileId) {
			alert('google drive not available');
			return
		}
		let SaveResult = await gapi.saveFile(fileId, JSON.stringify(collectionState), "");
		setSavedState(collectionState);
		console.log(SaveResult);
	}

	useEffect(() => {
		const id = window.setInterval(() => {
			if (fileId && JSON.stringify(collectionState) != JSON.stringify(savedState)) {
				console.log('saving!');
				saveCollectionState();
			}
		}, 15000);
		return () => window.clearInterval(id);
	}, [ collectionState, savedState ])

	return [ gapi.state, saveCollectionState ];
}
