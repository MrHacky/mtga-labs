import * as React from "react";

import { useState, useEffect, useReducer } from "react";

import { MtgaLogWatcher } from "./MtgaLogWatcher";
import { MtgaShowCollection } from "./MtgaShowCollection";
import { MtgaShowDecks } from "./MtgaShowDecks";
import { PlayerInfo } from "./components/PlayerInfo";
import { useMtgaCollectionReducer, mtgaCollectionState } from "./MtgaCollection"
import { usePersistCollectionState } from "./usePersistCollectionState";
import { useGoogleApi } from "./persistent-storage/storage";
import styled, { ThemeProvider } from "./themed-components";
import theme from "./theme";

const CollectionManager = styled.div`
	display: grid;
	grid-area: header;
	grid-template-columns: auto 1fr;
	box-shadow: ${p => p.theme.shadows.subtle};
	grid-gap: ${p => p.theme.margins.large};
	padding: ${p => p.theme.margins.small};	
`;


const SaveInfo = styled.div`
	display: grid;
	grid-template-columns: 90px;
	grid-gap: ${p => p.theme.margins.small};
	border-right: 1px solid grey;
`;

const Application = styled.div`
	display: grid;
	grid-template: 'header header header'
		'collection collection collection'; 
	grid-template-rows: auto 1fr;
	grid-gap: ${p => p.theme.margins.small};
`;

const CollectionWrapper = styled.div`
	grid-area: collection;
`;

export function App(props: {  }) {
	let gapi = useGoogleApi();
	useEffect(() => {
		if (gapi.state == 'out')
			gapi.signin();
	}, [ gapi.state ]);
	const [ collection, collectionDispatch ] = useReducer(useMtgaCollectionReducer, new mtgaCollectionState());
	usePersistCollectionState({
		gapi,
		filename: 'mtga-labs-collection.json',
		collectionState: collection,
		setCollectionState: json => collectionDispatch({ label: "mtga-labs-Inventory", json }),
	});

	return <ThemeProvider theme={theme}>
		<Application>
			<CollectionManager>
				<SaveInfo>
					<span>{gapi.state}</span>
				</SaveInfo>
				<MtgaLogWatcher onLogEntry={collectionDispatch}/>
			</CollectionManager>
			<CollectionWrapper>
				<PlayerInfo collection={collection} />
				<br/>
				<MtgaShowDecks collection={collection} gapi={gapi}/>
				<MtgaShowCollection collection={collection}/>
			</CollectionWrapper>
		</Application>
	</ThemeProvider>
}
