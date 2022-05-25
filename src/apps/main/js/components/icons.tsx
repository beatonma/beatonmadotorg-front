import React, { HTMLAttributes } from "react";
import { joinClassNames } from "./props";

export function MaterialIcon(props: HTMLAttributes<any>) {
    const { className, children, ...rest } = props;

    return (
        <span className={joinClassNames(className, "material-icons")} {...rest}>
            {children}
        </span>
    );
}
