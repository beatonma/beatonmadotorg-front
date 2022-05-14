import React, { HTMLAttributes } from "react";

interface TooltipProps extends HTMLAttributes<any> {
    popupText: string;
}

export function Tooltip(props: TooltipProps) {
    const { children, popupText, ...rest } = props;

    return (
        <div className="tooltip" {...rest} data-tooltip={popupText}>
            {children}
        </div>
    );
}
