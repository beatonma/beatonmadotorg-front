import React from "react";
import { classNames, LayoutProps } from "./props";

export function Label(props: LayoutProps) {
    return <div className={classNames(props, "label")}>{props.children}</div>;
}
