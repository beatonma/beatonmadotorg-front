import React from "react";

export function Row(props) {
    const className = props.className || "";

    return <div className={`row ${className}`}>{props.children}</div>;
}
