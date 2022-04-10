import { ReactNode } from "react";

export interface ClassNameProps {
    className?: string;
}

export interface LayoutProps extends ClassNameProps {
    children?: ReactNode | ReactNode[];
}

export function classNames(props: ClassNameProps, additionalClasses: string) {
    const { className } = props;

    return className ? `${additionalClasses} ${className}` : additionalClasses;
}

export function joinClassNames(existing: string, additionalClasses: string) {
    if (additionalClasses) {
        return `${additionalClasses} ${existing}`;
    } else {
        return existing;
    }
}
