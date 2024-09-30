export function SinglePlay() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 130 100"
        >
            <path d="M30 10L30 90 110 50z"></path>
        </svg>
    );
}


export function DoublePlay() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="20 0 160 100"
        >
            <path d="M30 10L30 90 110 50z"></path>
            <path d="M90 10L90 90 170 50z"></path>
        </svg>
    );
}

export function Pause() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 100 100"
        >
            <path d="M25 20H45V80H25z"></path>
            <path d="M55 20H75V80H55z"></path>
        </svg>
    );
}

export function SkipSmall() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 130 100"
        >
            <path d="M30 10L30 90 110 50z"></path>
            <path d="M100 10H115V90H100z"></path>
        </svg>
    );
}

export function SkipSmallLeft() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 130 100"
        >
            <path d="M110 10L110 90 30 50z"></path> {/* Triangle pointing left */}
            <path d="M15 10H30V90H15z"></path> {/* Rectangle on the left */}
        </svg>
    );
}

export function SkipLarge() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="20 0 170 100"
        >
            <path d="M30 10L30 90 110 50z"></path>
            <path d="M90 10L90 90 170 50z"></path>
            <path d="M160 10H175V90H160z"></path>
        </svg>
    );
}

export function SkipLargeLeft() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 170 100"
        >
            <path d="M110 10L110 90 30 50z"></path> {/* First triangle pointing left */}
            <path d="M170 10L170 90 90 50z"></path>
            <path d="M15 10H30V90H15z"></path> {/* Rectangle on the left */}
        </svg>
    );
}
