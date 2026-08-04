export function maintainAspectFitContain(
    containerWidth: number,
    containerHeight: number,
    aspectRatio: number,
): [number, number] {
    const cAspect = containerWidth / containerHeight;
    if(aspectRatio > cAspect) {
        return [
            containerWidth,
            containerWidth / aspectRatio,
        ];
    } else {
        return [
            containerHeight * aspectRatio,
            containerHeight,
        ];
    }
}

export function maintainAspectFitCover(
    containerWidth: number,
    containerHeight: number,
    aspectRatio: number,
): [number, number] {
    const cAspect = containerWidth / containerHeight;
    if(aspectRatio > cAspect) {
        return [
            containerHeight * aspectRatio,
            containerHeight,
        ];
    } else {
        return [
            containerWidth,
            containerWidth / aspectRatio,
        ];
    }
}
export function maintainAspectCropContain(
    sourceWidth: number,
    sourceHeight: number,
    aspectRatio: number,
): [number, number] {
    const sAspect = sourceWidth / sourceHeight;
    if(aspectRatio > sAspect) {
        return [
            sourceHeight * aspectRatio,
            sourceHeight,
        ];
    } else {
        return [
            sourceWidth,
            sourceWidth / aspectRatio,
        ];
    }
}

export function maintainAspectCropCover(
    sourceWidth: number,
    sourceHeight: number,
    aspectRatio: number,
): [number, number] {
    const sAspect = sourceWidth / sourceHeight;
    if(aspectRatio > sAspect) {
        return [
            sourceWidth,
            sourceWidth / aspectRatio,
        ];
    } else {
        return [
            sourceHeight * aspectRatio,
            sourceHeight,
        ];
    }
}