import React, { HTMLAttributes } from "react";
import { classNames } from "./props";

export function Label(props: HTMLAttributes<HTMLDivElement>) {
    return <div className={classNames(props, "label")}>{props.children}</div>;
}
