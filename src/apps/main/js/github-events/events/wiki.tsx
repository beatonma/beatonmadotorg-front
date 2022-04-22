import React from "react";
import { WikiEdit } from "../types";

interface WikiEventProps {
    edits: WikiEdit[];
}
export function WikiEvents(props: WikiEventProps) {
    const edits = props.edits;

    if (edits.length == 0) return null;

    return (
        <div className="github-event" data-type="wiki">
            {edits.length} wiki edits
        </div>
    );
}
