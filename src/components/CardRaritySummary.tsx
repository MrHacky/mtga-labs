import * as React from "react";
import styled from "../themed-components";

const CardRarities = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
`;

const CardCount = styled.div`
    color: white;
    padding: ${p => p.theme.margins.small}
`;

const CommonCard = styled(CardCount)`
    background: ${p => p.theme.colors.common};
`;

const UncommonCard = styled(CardCount)`
    background: ${p => p.theme.colors.uncommon};
`;

const RareCard = styled(CardCount)`
    background: ${p => p.theme.colors.rare};
`;

const MythicCard = styled(CardCount)`
    background: ${p => p.theme.colors.mythic};
`;

interface TCardRaritySummaryProps {
    common: number;
    uncommon: number;
    rare: number;
    mythic: number;
}

export function CardRaritySummary({ common, uncommon, rare, mythic }: TCardRaritySummaryProps) {
    
   return <CardRarities>
        <CommonCard>Common: {common}</CommonCard>
        <UncommonCard>Uncommon: {uncommon}</UncommonCard>
        <RareCard>Rare: {rare}</RareCard>
        <MythicCard>Mythic: {mythic}</MythicCard>
    </CardRarities>
}