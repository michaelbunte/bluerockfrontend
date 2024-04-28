import { useState, useEffect } from 'react';
import {Box} from 'adminlte-2-react';

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

export function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}


export const CenteredBox = (props) => {
    return <Box style={{maxWidth: '1000px', margin: 'auto'}} {...props} />;
}

export function PrettyBox({
    contents,
    topColor="#54b8ff",
    width="100%",
    height=undefined,
    title=undefined
}) {
    return <div style={{
        borderTop: `4px ${topColor} solid`,
        padding: "10px",
        margin: "10px",
        background: "white",
        borderRadius: "5px",
        height: height,
        boxShadow: "0px 0px 17px 1px rgba(0,0,0,0.32)",
        flex: 1,
        width: width
    }}>
        {title && <div style={{fontSize: "2rem"}}>{title}</div>}
        {contents}
    </div>
}
