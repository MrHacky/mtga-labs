import * as React from "react";
import { mtgaCollectionState } from "../MtgaCollection";
import styled from "../themed-components";
import { CardRaritySummary } from "./CardRaritySummary";
interface TPlayerInfoProps {
	collection: mtgaCollectionState
}

const PlayerInfoWrapper = styled.div`
	display: grid;
	grid-template-columns: 1fr 2fr;
	grid-gap: 20px;
`;

const Currencies = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
`;

export function PlayerInfo({ collection }: TPlayerInfoProps) {    
	const { gold, gems, wcCommon, wcUncommon, wcRare, wcMythic, vaultProgress } = collection;

	let totalCards = 0;
	for (let card in collection.cards)
		totalCards += collection.cards[card];    

	return (
		<PlayerInfoWrapper>
			<Currencies>
				<div>Cards: {totalCards}</div>     {/* Not a real 'Currency', should it be here? Should Currencies be renamed? */}
				<div>Vault: {vaultProgress}%</div> {/* ^ */}
				<div>Gold: {gold}</div>
				<div>Gems: {gems}</div>
			</Currencies>
			<CardRaritySummary
				common={wcCommon} 
				uncommon={wcUncommon}
				rare={wcRare}
				mythic={wcMythic}
			/>
		</PlayerInfoWrapper>
	);
}