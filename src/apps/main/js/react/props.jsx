export function classNames(props, additionalClasses) {
    return props.className
        ? `${additionalClasses} ${props.className}`
        : additionalClasses;
}
