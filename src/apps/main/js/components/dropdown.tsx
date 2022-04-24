import React, { useState } from "react";
import { MaterialIcon } from "./icons";
import { joinClassNames, LayoutProps } from "./props";

interface DropdownProps extends LayoutProps {
    expandedDefault?: boolean;
    title: string | React.ReactNode;
}
export function Dropdown(props: DropdownProps) {
    const { expandedDefault, title, className, children, ...rest } = props;

    const [expanded, setExpanded] = useState(expandedDefault || false);
    const toggle = () => setExpanded(!expanded);

    return (
        <div
            className={joinClassNames(className, "dropdown")}
            data-expanded={expanded}
            {...rest}
        >
            <div className="row dropdown-header" onClick={toggle}>
                <div className="dropdown-title">{title}</div>
                <MaterialIcon
                    className="dropdown-icon"
                    data-expanded={expanded}
                >
                    arrow_drop_down
                </MaterialIcon>
            </div>

            <div className="dropdown-content" data-expanded={expanded}>
                {children}
            </div>
        </div>
    );
}
