import { ReactNode } from "react";

export interface ClassNameProps {
    className?: string;
}

export interface LayoutProps extends ClassNameProps {
    children?: ReactNode | ReactNode[];
}

export function classNames(props: ClassNameProps, additionalClasses: string) {
    const { className } = props;

    return joinClassNames(className, additionalClasses);
}

export function joinClassNames(existing: string, additionalClasses: string) {
    if (existing && additionalClasses) {
        return `${additionalClasses} ${existing}`;
    } else if (existing) {
        return `${existing}`;
    } else {
        return `${additionalClasses}`;
    }
}
