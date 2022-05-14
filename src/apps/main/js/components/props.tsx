import { HTMLAttributes } from "react";

export function classNames(
    props: HTMLAttributes<any>,
    additionalClasses: string
) {
    return joinClassNames(props.className, additionalClasses);
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
