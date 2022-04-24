import React from "react";
import { MaterialIcon } from "./icons";
import { joinClassNames, LayoutProps } from "./props";

interface TextWithIconProps extends LayoutProps {
    icon: string | React.ReactNode;
    text?: string | React.ReactNode;
    dangerousHtml?: string;
}

export function TextWithIcon(props: TextWithIconProps) {
    const { icon, text, dangerousHtml, className, ...rest } = props;

    return (
        <div className={joinClassNames(className, "text-with-icon")} {...rest}>
            <MaterialIcon>{icon}</MaterialIcon>
            <span className="spacer" />
            {dangerousHtml ? (
                <span dangerouslySetInnerHTML={{ __html: dangerousHtml }} />
            ) : (
                <span>{text}</span>
            )}
        </div>
    );
}
