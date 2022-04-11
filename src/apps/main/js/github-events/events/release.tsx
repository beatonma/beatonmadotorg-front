import React from "react";
import {ReleasePayload} from "../types";

interface ReleaseProps {
    release: ReleasePayload;
}

export function ReleaseEvent(props: ReleaseProps) {
    const release = props.release;

    return <div>
        Release: <a href={release.url}>{release.name}</a>
    </div>
}
