import React from "react";
import { classNames } from "./props";

export function Tag(props) {
    return <div className={classNames(props, "tag")}>{props.children}</div>;
}
