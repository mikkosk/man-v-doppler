import { MAX_HERZ, MIN_HERZ } from "./variables";

export const calculateSimilarity = (targetArray: {time: number, value: number}[], userArray: {time: number, value: number}[]) => {
    if(targetArray.length != userArray.length) {
        console.error("Arrays must be of same length");
        return;
    }

    let maxDifferenceSum = 0;
    let actualDifferenceSum = 0;

    for(let i = 0; i < targetArray.length; i++) {
        const targetValue = targetArray[i].value;
        const userValue = userArray[i].value;
        const difference = Math.abs(targetValue - userValue);
        const maxDifferenceUp = MAX_HERZ - targetValue;
        const maxDifferenceDown = targetValue - MIN_HERZ;

        const maxDifference = Math.max(maxDifferenceUp, maxDifferenceDown);

        maxDifferenceSum += maxDifference;
        actualDifferenceSum += difference;
    }

    return 1 - (actualDifferenceSum / maxDifferenceSum);

}