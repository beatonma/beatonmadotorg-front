import React, { HTMLAttributes } from "react";
import { joinClassNames } from "./props";
import { Dropdown } from "./dropdown";

interface LargeFeedItemProps extends HTMLAttributes<any> {
    expandedDefault?: boolean;
    header: string | React.ReactNode;
    parentID: string;
}
export function LargeFeedItem(props: LargeFeedItemProps) {
    const { className, expandedDefault, parentID, ...rest } = props;

    const onToggle = (expanded: boolean) => {
        const container = document.querySelector(parentID) as HTMLElement;
        container.dataset.expanded = `${expanded}`;
    };

    return (
        <Dropdown
            className={joinClassNames(className, "feed-item-dropdown")}
            onToggle={onToggle}
            expandedDefault={expandedDefault ?? true}
            {...rest}
        />
    );
}
