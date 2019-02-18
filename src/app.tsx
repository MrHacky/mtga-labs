import * as React from "react";
import * as ReactDOM from "react-dom";

import { useState, useEffect, useReducer } from "react";

import { MtgaLogWatcher } from "./MtgaLogWatcher";
import { MtgaShowCollection } from "./MtgaShowCollection";
import { useMtgaCollectionReducer, mtgaCollectionState } from "./MtgaCollection"

export function App(props: {  }) {
	const [ collection, collectionDispatch ] = useReducer(useMtgaCollectionReducer, new mtgaCollectionState());
	return <div>
		<MtgaLogWatcher onLogEntry={collectionDispatch}></MtgaLogWatcher>
		<MtgaShowCollection collection={collection}></MtgaShowCollection>
	</div>
}
