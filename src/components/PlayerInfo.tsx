import * as React from "react";
import { mtgaCollectionState } from "../MtgaCollection";
import styled from "styled-components";

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

const CardRarities = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
`;

export function PlayerInfo({ collection }: TPlayerInfoProps) {    
    const { gold, gems, wcCommon, wcUncommon, wcRare, wcMythic } = collection;

    return (
        <PlayerInfoWrapper>
            <Currencies>
                <div>Gold: {gold}</div>
                <div>Gems: {gems}</div>
            </Currencies>
            <CardRarities>
                <div>Common: {wcCommon}</div>
                <div>Uncommon: {wcUncommon}</div>
                <div>Rare: {wcRare}</div>
                <div>Mythic: {wcMythic}</div>
            </CardRarities>
        </PlayerInfoWrapper>
    );
}