import React, { useState } from "react";
import { MaterialIcon } from "./icons";
import { classNames, LayoutProps } from "./props";

interface DropdownProps extends LayoutProps {
    expandedDefault?: boolean;
    title: string;
}
export function Dropdown(props: DropdownProps) {
    const [expanded, setExpanded] = useState(props.expandedDefault || false);

    const toggle = () => setExpanded(!expanded);

    return (
        <div className={classNames(props, "dropdown")} data-expanded={expanded}>
            <div className="row dropdown-header" onClick={toggle}>
                <div className="dropdown-title">{props.title}</div>
                <MaterialIcon
                    className="dropdown-icon"
                    data-expanded={expanded}
                >
                    arrow_drop_down
                </MaterialIcon>
            </div>

            <div className="dropdown-content" data-expanded={expanded}>
                {props.children}
            </div>
        </div>
    );
}
