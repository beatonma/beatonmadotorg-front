import React, { HTMLAttributes } from "react";
import { classNames } from "./props";

export function Tag(props: HTMLAttributes<HTMLDivElement>) {
    return <div className={classNames(props, "tag")}>{props.children}</div>;
}
