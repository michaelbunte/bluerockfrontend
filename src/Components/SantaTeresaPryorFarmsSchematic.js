import {
    LIGHTGREYCOLOR, LIGHTBLUECOLOR, BLUECOLOR, WHITECOLOR, GREENCOLOR,
    PINKCOLOR, REDCOLOR, DARKBLUECOLOR,
    titleProps, normalTextProps, smallTextProps,
    getFlowColor, getAngle, getDirection,
    PumpSymbol, SensorIndicator, ValveIndicator, VariableValveIndicator,
    StaticRelativeText, RelativeText, ThreeWayValveIndicator, MultiMediaFilter,
    CheckValve, ArrowPolyLine, ChemicalFeed, SingleFilter, DoubleFilter,
    PressureTank, ROVessel, TextArray, Drain, KeyElementWrapper, Key,
    LiquidFillGaugeWrapper, DevToolsDisplay, AnimatedPipe, ThreeWayVariableValveIndicator
} from "./DetailedDashComponents.jsx"

import { Box, Col, Row, Content, SimpleTable, Inputs, Badge, Tabs, TabContent } from 'adminlte-2-react';
import React, { useState } from 'react';

function FeedTankSystem({md}) {
    return (
        <g>
            <rect rx="10" x="220" y="10" width="220px" height="210px" fill="#fceade" />
            <text x="247" y="40" {...titleProps}>
                FEED TANK SYSTEM
            </text>
            <AnimatedPipe paths={[[[260, 160], [260, 100], [284, 100]]]} />
            <AnimatedPipe paths={[[[342, 100], [529, 100]]]} />
            <SensorIndicator
                x="334.5" y="169.5"
                line="up"
                innerText="LT100"
                textDir="down"
                outerText="999 gallons"
                smallInner={true} />
            <PumpSymbol x="260" y="160" innerText="WP" />
            <LiquidFillGaugeWrapper x="320" y="90" />
            <SensorIndicator WaterScope x="394.5" y="100" innerText="100" />
        </g>
    );
}

function FlushTankSystem({md}) {
    return (
        <g>
            <rect rx="10" x="220" y="230" width="220px" height="210px" fill="#e8cdf7" />
            <text x="330" y="260" {...titleProps} textAnchor="middle">
                FLUSH TANK SYSTEM
            </text>
            <AnimatedPipe stroke={LIGHTBLUECOLOR} paths={[[[313, 330.5], [468.5, 330.5], [468.5, 200.5], [535.5, 200.5]]]} />
            <AnimatedPipe stroke={LIGHTBLUECOLOR} paths={[[[568, 699.5], [568, 759.5], [230.5, 759.5], [230.5, 330.5], [253.5, 330.5]]]} />

            <LiquidFillGaugeWrapper x="290" y="320" />
            <SensorIndicator
                x="290" y="400"
                line="up"
                innerText="LT3"
                textDir="right"
                outerText="999 gallons" />
            <PumpSymbol x="382.5" y="330" innerText="E13" />
        </g>
    );
}

function ResidualSeptic({md}) {
    return (
        <g>
            <rect rx="10" x="250" y="450" width="190px" height="210px" fill="#fff2cc" />
            <text x="350" y="480" {...titleProps} textAnchor="middle">
                Residual/Septic
            </text>
            <Drain x="320" y="584.5" text="Septic Line" textDir="down" />
            <AnimatedPipe stroke={PINKCOLOR} paths={[[[594.5, 634.5], [484.5, 634.5], [484.5, 524.5], [314.5, 524.5], [314.5, 559]]]} />
            <AnimatedPipe stroke={LIGHTBLUECOLOR} paths={[[[568, 695], [468, 695], [468, 539.5], [328, 539.5], [328, 559.5]]]} />
        </g>
    );
}

function ROSystem({md}) {
    return (
        <>
            <rect rx="10" x="450" y="10" width="650px" height="770px" fill="#d3e4fc" />
            <text x="770" y="40" {...titleProps} textAnchor="middle">
                REVERSE OSMOSIS SYSTEM
            </text>
            <AnimatedPipe stroke={LIGHTBLUECOLOR} paths={[[[578.5, 200], [858.5, 200], [858.5, 108.5]]]} />
            <AnimatedPipe paths={[[[572, 100], [892, 100]]]} junctionPositions={[[858.5, 99.5]]} />
            <AnimatedPipe paths={[[[958.5, 99.5], [1008.5, 99.5], [1008.5, 269.5], [521.5, 269.5], [521.5, 349.5]]]} />
            <AnimatedPipe paths={[[[521.5, 360.5], [724.5, 360.5]]]} junctionPositions={[[521.5, 360.5]]} />
            <AnimatedPipe paths={[[[754.5, 360.5], [822, 360.5], [822, 410.5]]]} />
            <AnimatedPipe paths={[[[521.5, 420.5], [521.5, 370.5]]]} />
            <AnimatedPipe stroke={PINKCOLOR} paths={[[[690, 579], [690, 623]]]} />
            <AnimatedPipe stroke={PINKCOLOR} paths={[[[902.5, 458.5], [902.5, 549]]]} />
            <AnimatedPipe stroke={PINKCOLOR} paths={[[[802.5, 634.5], [627.5, 634.5]]]} junctionPositions={[[690, 633.5]]} />
            <AnimatedPipe
                stroke={PINKCOLOR}
                paths={[[[902.5, 561.5], [724, 561.5]]]}
                junctionPositions={[[902.5, 561.5]]} />
            <AnimatedPipe stroke={PINKCOLOR} paths={[[[674, 561.5], [522, 561.5], [522, 464.5]]]} />
            <AnimatedPipe stroke={PINKCOLOR} paths={[[[902.5, 561.5], [902.5, 635], [868, 635]]]} />
            <AnimatedPipe stroke={LIGHTBLUECOLOR} paths={[[[922.5, 437], [972.5, 437], [972.5, 677], [770.5, 677], [770.5, 689]]]} />
            <AnimatedPipe stroke={LIGHTBLUECOLOR} paths={[[[739.5, 724], [669.5, 724], [669.5, 695], [603.5, 695]]]} />

            <SensorIndicator
                x="628"
                y="100"
                innerText="PT1"
                outerText="999 PSI"
                textDir="up" />
            <MultiMediaFilter
                x="703" y="130"
                textDir="down"
                outerText={<TextArray textArray={["MultiMedia", "Filter (MMF)"]} />}
            />
            <ValveIndicator x="793" y="100" innerText="AV1" />
            <DoubleFilter
                x="932.5"
                y="118"
                innerText1="20"
                innerText2="μm"
                innerText3="5"
                innerText4="μm" />
            <SensorIndicator
                x="590" y="360"
                textDir="down"
                outerText="999 PSI"
                innerText="PT2" />
            <SensorIndicator
                x="670" y="360"
                innerText="FT1"
                outerText="999 GPM"
                textDir="up" />
            <PumpSymbol
                x="750" y="360"
                innerText="P2" />
            <SensorIndicator
                x="860" y="360"
                line="left"
                innerText="PT3"
                textDir="up"
                outerText="999 PSI" />
            <SensorIndicator
                x="912" y="270"
                innerText="CT1"
                textDir="up"
                outerText="999 μS/m" />
            <SensorIndicator
                x="762" y="270"
                innerText="FTF"
                outerText="999 GPM"
                textDir="up" />
            <CheckValve dir="up" x="522.5" y="438" />
            <ArrowPolyLine stroke="black" points="983,277 983,367 1013,367" />
            <ChemicalFeed
                x="1032.5" y="358"
                text={<TextArray textArray={["Antiscalant", "Dosing"]} />}
                textDir="down" />
            <SensorIndicator
                x="522" y="500"
                innerText="FTR"
                outerText="999 GPM"
                textDir="right" />
            <ROVessel
                x="862" y="437"
                nubPositions={[[-40, -17], [40, 17]]}
                innerText="RO Vessel 1-3" />
            <SensorIndicator
                x="902" y="505.5"
                innerText="PT4"
                outerText="999 PSI"
                textDir="left" />
            <VariableValveIndicator
                x="812" y="560.5"
                outerText="AV3 20%"
                textDir="up" />
            <ThreeWayVariableValveIndicator
                dir="left" x="690" y="560.5"
                textDir="up"
                outerText="AV4"
            />
            <ValveIndicator
                x="832.5" y="634.5"
                innerText="AV5" />
            <SensorIndicator
                x="972" y="475"
                innerText="NT1"
                outerText={<TextArray textArray={["999", "mg/L as NO₃-N"]} />} />
            <SensorIndicator
                x="972" y="525"
                innerText="CT2"
                outerText="999 μS/m"
            />
            <SensorIndicator
                x="972" y="575"
                innerText="FT3"
                outerText="999 GPM" />
            <SensorIndicator
                x="972" y="625"
                innerText="TT1"
                outerText="999 C" />
            <SensorIndicator
                x="942" y="399"
                line="down"
                innerText="PT5"
                outerText="999 PSI"
                textDir="up" />
        </>
    )
}

function ROSystemTopLayer({md}) {
    return (
        <>
            <PumpSymbol
                x="491" y="100"
                innerText="P1" />
            <CheckValve x="554" y="100" />
            <CheckValve x="560" y="200" />
            <SensorIndicator
                WaterScope
                x="522.5" y="634.5"
                innerText="200" />
            <SensorIndicator
                x="602.5" y="634.5"
                innerText="FT2" />
            <ThreeWayValveIndicator
                dir="left"
                x="568" y="695"
                innerText="AV7" />
            <SensorIndicator
                x="839" y="725"
                innerText="FTP"
                textDir="down"
                outerText="999 GPM" />
            <SensorIndicator
                x="929" y="725"
                innerText="CTP"
                textDir="up"
                outerText="999 μS/m" />
            <SensorIndicator
                x="1019" y="725"
                innerText="NTP"
                outerText="999 mg/L as NO₃-N"
                textDir="down"
            />
            <ThreeWayValveIndicator
                x="769" y="725"
                innerText="AV6" />
        </>
    )
}

function DeliverySystem({md}) {
    return (
        <>
            <rect rx="10" x="1110" y="10" width="220px" height="450px" fill="#dceef3" />
            <text x="1220" y="40" {...titleProps} textAnchor="middle">
                WATER
            </text>
            <text x="1220" y="60" {...titleProps} textAnchor="middle">
                DELIVERY SYSTEM
            </text>
            <text x="1180" y="90" {...normalTextProps} textAnchor="middle">
                Distribution
            </text>
            <AnimatedPipe stroke={LIGHTBLUECOLOR} paths={[[[1240, 544.5], [1170, 544.5], [1170, 379.5]]]} />
            <AnimatedPipe stroke={LIGHTBLUECOLOR} paths={[[[1201.5, 329], [1271.5, 329], [1271.5, 259]]]} />
            <AnimatedPipe stroke={LIGHTBLUECOLOR} paths={[[[1271.5, 215], [1271.5, 145], [1181.5, 145], [1181.5, 105]]]} />
            <SensorIndicator
                x="1181.5" y="262.5" line="down"
                innerText="LT200"
                smallInner={true}
                textDir="up"
                outerText="999 gallons" />
            <LiquidFillGaugeWrapper x="1181.5" y="328.5" />
            <PumpSymbol
                x="1271.5" y="328.5"
                innerText="P3"
                textDir="down"
                outerText={<TextArray textArray={["Existing Delivery", "Pump"]} />} />
            <CheckValve dir="up" x="1271.5" y="232.5" />
            <SensorIndicator
                x="1271.5" y="142.5"
                innerText="PT6"
                outerText="999 PSI"
                textDir="up" />
            <MultiMediaFilter
                x="1246"
                y="584.5"
                outerText="Remineralizer"
                textDir="down" />
            <SensorIndicator
                x="1170" y="544.5"
                innerText="CT3"
                textDir="left"
                outerText="999 μS/m" />

        </>
    )
}

function TreatmentChip({md}) {
    return (
        <>
            <rect rx="10" x="1110" y="470" width="220px" height="310px" fill="#ebf1de" />
            <ArrowPolyLine stroke='black' points="1251.5,718.5 1251.5,658.5 1191.5,658.5" />
            <AnimatedPipe stroke={LIGHTBLUECOLOR} paths={[[[1198.5, 725], [1302.5, 725], [1302.5, 545], [1271.5, 545]]]} />
            <AnimatedPipe stroke={LIGHTBLUECOLOR} paths={[[[769.5, 725], [1155, 725]]]} />
            <CheckValve x="1180" y="724.5" />
            <ChemicalFeed
                x="1171.5"
                y="645"
                text={<TextArray textArray={["Chlorine Dosing"]} />}
                textDir="down"
            />
        </>
    )
}

function SantaTeresaPryorFarmsSchematic({md}) {
    return (
        <svg width="100%" height="100%" viewBox="0 0 1120 790">
            <rect x="0" y="0" width="100000" height="10000" fill="green"/>
            <g transform="translate(-215,0)">
                <ROSystem md={md}/>
                <FeedTankSystem md={md}/>
                <FlushTankSystem md={md}/>
                <ResidualSeptic md={md}/>
                <TreatmentChip md={md}/>
                <DeliverySystem md={md}/>
                <ROSystemTopLayer md={md}/>
            </g>
        </svg>
    )
}



export default SantaTeresaPryorFarmsSchematic;