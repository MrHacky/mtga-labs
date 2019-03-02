import { useState, useEffect, useReducer } from "react";

import { useGoogleApi } from "./persistent-storage/storage";

async function doInitCollectionFile(gapi, setResult) {
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
	setResult(JSON.parse(content.body))
	return fileid;
}

export function usePersistCollectionState({ setCollectionState }): [string, (state: any) => void] {
	let gapi = useGoogleApi();
	let [ promise, setPromise ] = useState(null);
	let [ fileId, setFileId ] = useState(null);

	useEffect(() => {
		console.log('effect:' + gapi.state);
		if (gapi.state == 'out') {
			console.log('signin');
			gapi.signin();
		}
		if (gapi.state == 'in' && !promise) {
			setPromise(doInitCollectionFile(gapi, setCollectionState).then(setFileId));
		}
	}, [gapi.state, promise]);


	async function saveCollectionState(state): Promise<void> {
		if (!fileId) {
			alert('google drive not available');
			return
		}
		let SaveResult = await gapi.saveFile(fileId, JSON.stringify(state), "");
		console.log(SaveResult);
	}
	
	return [ gapi.state, saveCollectionState ];
}