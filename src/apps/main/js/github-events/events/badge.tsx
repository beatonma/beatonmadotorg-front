import React from "react";
import { Url } from "../types/common";
import { joinClassNames, LayoutProps } from "../../components/props";
import { TextWithIcon } from "../../components/text-with-icon";

interface BadgeProps extends LayoutProps {
    url: Url;
    icon: string;
    issue: number;
    title: string;
}

export function Badge(props: BadgeProps) {
    const { url, title, icon, issue, className, ...rest } = props;

    return (
        <a href={url} title={title}>
            <TextWithIcon
                icon={icon}
                text={`${issue}`}
                className={joinClassNames(className, "badge")}
                {...rest}
            />
        </a>
    );
}
