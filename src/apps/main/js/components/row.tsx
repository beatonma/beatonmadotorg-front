import React from "react";
import { LayoutProps } from "./props";

export function Row(props: LayoutProps) {
    const className = props.className || "";

    return <div className={`row ${className}`}>{props.children}</div>;
}
