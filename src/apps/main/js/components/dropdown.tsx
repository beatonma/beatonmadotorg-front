import React, { HTMLAttributes, KeyboardEvent, useId, useState } from "react";
import { MaterialIcon } from "./icons";
import { joinClassNames } from "./props";

interface DropdownProps extends HTMLAttributes<any> {
    expandedDefault?: boolean;
    header: string | React.ReactNode;
    onToggle?: (expanded: boolean) => void;
}
export function Dropdown(props: DropdownProps) {
    const { expandedDefault, header, onToggle, className, children, ...rest } =
        props;

    const [expanded, setExpanded] = useState(expandedDefault || false);
    const contentID = useId();

    const toggle = () => {
        const value = !expanded;
        setExpanded(value);
        onToggle?.(value);
    };

    const onKeyDown = (event: KeyboardEvent) => {
        console.log(event.key);
        if (event.code === "Enter" || event.code === "Space") {
            event.preventDefault();
            toggle();
        }
    };

    return (
        <div
            className={joinClassNames(className, "dropdown")}
            data-expanded={expanded}
            {...rest}
        >
            <div
                className="dropdown-header"
                onClick={toggle}
                onKeyDown={onKeyDown}
                aria-expanded={expanded}
                aria-controls={contentID}
                role="button"
                tabIndex={0}
            >
                <div className="dropdown-title">{header}</div>
                <MaterialIcon
                    className="dropdown-icon"
                    data-expanded={expanded}
                >
                    arrow_drop_down
                </MaterialIcon>
            </div>

            <div
                id={contentID}
                className="dropdown-content"
                data-expanded={expanded}
            >
                {children}
            </div>
        </div>
    );
}
