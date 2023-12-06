import { MAX_HERZ, MIN_HERZ } from "./variables";

const getDistanceFromMiddle = (speedKmh: number, MAX_TIME: number) => {
    const speedMps = speedKmh / 3.6;
    const distanceFromMiddle = speedMps * MAX_TIME / 1000 / 2;
    return distanceFromMiddle;
}

const getRandomHerz = () => {
    return Math.max(MIN_HERZ, MAX_HERZ * Math.random());
}

type SeedPoint = {
    herz: number,
    startTime: number, // on scale from 0 to 1
}
export const getLinearPoints = (points: SeedPoint[], endHerz: number, MAX_TIME: number, INTERVAL_MS: number) => {
    const linearPoints: {value: number, time: number}[] = []

    // start from the first point approach the second point with a linear function until the second point is reached
    // the second point should be reached when MAX_TIME * startTime is reached

    const numberOfPoints = MAX_TIME / INTERVAL_MS + 1; // since the first point is at 0

    console.log("NUMBER OF POINTS", numberOfPoints)
    const pointsWithStartIntervals = points.map((p) => {
        const startInterval = Math.floor(numberOfPoints * p.startTime);
        return { ...p, startInterval };
    });

    console.log("SEED POINTS", points, pointsWithStartIntervals)

    const pointsOverlappingFiltered = pointsWithStartIntervals.reduce((acc, point) => {
        const overlapping = acc.find((p) => p.startInterval === point.startInterval);
        if (overlapping) {
            return acc;
        } else {
            return [...acc, point];
        }
    }, [] as (SeedPoint & {startInterval: number})[]);

    console.log("OVERLAPPING FILTERED", pointsOverlappingFiltered)
    console.info("Filtered", pointsWithStartIntervals.length - pointsOverlappingFiltered.length, "overlapping points");

    for (let i = 0; i < pointsOverlappingFiltered.length - 1; i++) {
        const startPoint = pointsOverlappingFiltered[i];
        const endPoint = pointsOverlappingFiltered[i + 1];

        const durationInIntervals = endPoint.startInterval - startPoint.startInterval;
        const herzDifference = endPoint.herz - startPoint.herz;

        const herzStep = herzDifference / durationInIntervals;

        for (let j = 0; j < durationInIntervals; j++) {
            const herz = startPoint.herz + herzStep * j;
            linearPoints.push({value: herz, time: startPoint.startInterval * INTERVAL_MS + j * INTERVAL_MS});
        }
        
    }

    console.log("LINEAR POINTS", linearPoints)
    return linearPoints;

}

const getSemiRandomPointTime = (numberOfRandomPoints: number, index: number, MAX_TIME: number) => {

    const equalPortionOfTime = MAX_TIME / (numberOfRandomPoints);

    const timeStart = equalPortionOfTime * index; 
    const timeEnd = equalPortionOfTime * (index + 1);

    const randomTime = Math.random() * (timeEnd - timeStart) + timeStart;

    return randomTime / MAX_TIME;

    
}



export const createNewLevelWithSeedPoints = (speedKmh: number, numberOfSeeds: number, MAX_TIME: number) => {
    const startPoint: SeedPoint = {
        herz: getRandomHerz(),
        startTime: 0,
    };

    const endPoint: SeedPoint = {
        herz: getRandomHerz(),
        startTime: 1,
    };

    const numberOfRandomPoints = numberOfSeeds - 2;

    const randomPoints: SeedPoint[] = new Array(numberOfRandomPoints).fill(0).reduce((acc) => {
        const randomPointIndex = acc.length - 1; // since the first point is the start point, and not a random point
        const randomValue = getRandomHerz();
        const nextPoint: SeedPoint = {
            herz: randomValue,
            startTime: getSemiRandomPointTime(numberOfRandomPoints, randomPointIndex, MAX_TIME)
        };
        return [...acc, nextPoint];
    }, [startPoint]);

    const seedPoints = [...randomPoints, endPoint];

    const level = { seedPoints, maxTime: MAX_TIME, distanceFromMiddle: getDistanceFromMiddle(speedKmh, MAX_TIME), speed: speedKmh };

    return level;
};

export const createTargetArrayFromSeedPoints = (speedKmh: number, seedPoints: SeedPoint[], INTERVAL_MS: number, MAX_TIME: number) => {
    return getLinearPoints(seedPoints, 0, MAX_TIME, INTERVAL_MS);
}