import React from "react";
import { classNames } from "./props";

export function Label(props) {
    return <div className={classNames(props, "label")}>{props.children}</div>;
}
