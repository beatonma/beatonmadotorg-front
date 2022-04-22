import React from "react";
import { joinClassNames, LayoutProps } from "./props";

export function MaterialIcon(props: LayoutProps) {
    const { className, children, ...rest } = props;

    return (
        <span className={joinClassNames(className, "material-icons")} {...rest}>
            {children}
        </span>
    );
}
