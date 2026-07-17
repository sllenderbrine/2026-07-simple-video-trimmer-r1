export function clipEllipses(str: string, maxLength: number) {
    if(str.length <= maxLength) {
        return str;
    }
    return str.substring(0, maxLength) + "...";
}

export function clipStartEllipses(str: string, maxLength: number) {
    if(str.length <= maxLength) {
        return str;
    }
    return "..." + str.substring(str.length - maxLength, str.length);
}

export function trimEveryLine(str: string) {
    return str.split("\n").map(v => v.trim()).join("\n");
}