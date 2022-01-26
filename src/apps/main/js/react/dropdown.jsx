import React, { useState } from "react";
import { classNames } from "./props";

export function Dropdown(props) {
    const [expanded, setExpanded] = useState(props.expanded || false);
    const iconCls = expanded ? "rotate-180" : "";
    const contentCls = expanded ? "expanded" : "hidden";

    const toggle = () => setExpanded(!expanded);

    return (
        <div className={classNames(props, "dropdown")} onClick={toggle}>
            <div className="row dropdown-header">
                <div className="dropdown-title">{props.title}</div>
                <div className={`dropdown-icon material-icons ${iconCls}`}>
                    arrow_drop_down
                </div>
            </div>
            <div className={`dropdown-content ${contentCls}`}>
                {props.children}
            </div>
        </div>
    );
}
