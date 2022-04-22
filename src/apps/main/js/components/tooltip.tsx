import React from "react";
import { LayoutProps } from "./props";

interface TooltipProps extends LayoutProps {
    popupText: string;
}

export function Tooltip(props: TooltipProps) {
    const { children, popupText, ...rest } = props;

    return (
        <div className="tooltip" {...rest}>
            {children}
            <div className="tooltip-popup">{popupText}</div>
        </div>
    );
}
