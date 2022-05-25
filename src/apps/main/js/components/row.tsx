import React, { HTMLAttributes } from "react";

export function Row(props: HTMLAttributes<HTMLDivElement>) {
    const className = props.className || "";

    return <div className={`row ${className}`}>{props.children}</div>;
}
