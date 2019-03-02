import * as React from "react";
import * as ReactDOM from "react-dom";

import { useState, useEffect, useReducer } from "react";

import { MtgaLogWatcher } from "./MtgaLogWatcher";
import { MtgaShowCollection } from "./MtgaShowCollection";
import { useMtgaCollectionReducer, mtgaCollectionState } from "./MtgaCollection"
import { usePersistCollectionState } from "./usePersistCollectionState";


export function App(props: {  }) {
	const [ collection, collectionDispatch ] = useReducer(useMtgaCollectionReducer, new mtgaCollectionState());
	const [ state, saveCollectionState ] = usePersistCollectionState({
		setCollectionState: json => collectionDispatch({ label: "mtga-labs-Inventory", json }),
	});

	return <div>
		{state}
		<button onClick={() => saveCollectionState(collection)}>Save</button>
		<MtgaLogWatcher onLogEntry={collectionDispatch}></MtgaLogWatcher>
		<MtgaShowCollection collection={collection}></MtgaShowCollection>
	</div>
}
