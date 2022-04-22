import React, { useEffect, useState } from "react";
import { classNames, LayoutProps } from "./props";
import { MaterialIcon } from "./icons";

interface LargeFeedItemProps extends LayoutProps {
    expandedDefault?: boolean;
    title: string | React.ReactNode;
    parentID: string;
}
export function LargeFeedItem(props: LargeFeedItemProps) {
    const [expanded, setExpanded] = useState<boolean>(
        props.expandedDefault || true
    );

    const toggle = () => {
        const value = !expanded;
        setExpanded(value);
        const container = document.querySelector(props.parentID) as HTMLElement;
        container.dataset.expanded = `${value}`;
    };

    useEffect(() => {
        const container = document.querySelector(props.parentID) as HTMLElement;
        container.dataset.expanded = `${expanded}`;
    }, []);

    return (
        <div
            className={classNames(props, "feed-item-dropdown")}
            data-expanded={expanded}
        >
            <div className="feed-item-dropdown-header" onClick={toggle}>
                <h5 className="feed-item-dropdown-title">{props.title}</h5>
                <MaterialIcon
                    className="feed-item-dropdown-icon"
                    data-expanded={expanded}
                >
                    arrow_drop_down
                </MaterialIcon>
            </div>

            <div
                className="feed-item-dropdown-content"
                data-expanded={expanded}
            >
                {props.children}
            </div>
        </div>
    );
}
