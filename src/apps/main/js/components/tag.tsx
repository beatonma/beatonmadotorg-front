import React from "react";
import { classNames, LayoutProps } from "./props";

export function Tag(props: LayoutProps) {
    return <div className={classNames(props, "tag")}>{props.children}</div>;
}
