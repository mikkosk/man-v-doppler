

export const calculateDopplerObservedFrequency = (
    playedFrequency: number,
    sourceSpeed: number, // km/h
    sourceLengthFromTheMiddle: number,
    observerLengthFromTheMiddle: number,
) => {

    console.log("CALCULATED")
    const sourceSpeedInMetersPerSecond = sourceSpeed / 3.6;

    const SPEED_OF_SOUND = 343;

    // Source travels on a road. The source legth from the middle is the distance from the middle of the road to the end of the source. 
    // Positive value means the source is moving towards the observer. Negative value means the source is moving away from the observer.
    // The observer length from the middle is the distance from the middle of the road to the observer on a 90 degree angle.


    // https://www.school-for-champions.com/science/sound_doppler_effect_equations.htm
    // vSr = vScosθ

    const angle = Math.atan(observerLengthFromTheMiddle / Math.abs(sourceLengthFromTheMiddle));

    const isMovingTowards = sourceLengthFromTheMiddle > 0;
    const vSr = sourceSpeedInMetersPerSecond * Math.cos(angle);

    const adjustedSourceSpeed = isMovingTowards ? -vSr : vSr;
    const observedFrequency = playedFrequency * SPEED_OF_SOUND / (SPEED_OF_SOUND + adjustedSourceSpeed);

    return observedFrequency;
};

export const calculateNeededUnmodifiedFrequency = (targetFrequency: number, sourceSpeed: number, sourceLengthFromTheMiddle: number, observerLengthFromTheMiddle: number) => {

    const sourceSpeedInMetersPerSecond = sourceSpeed / 3.6;

    const SPEED_OF_SOUND = 343;

    const angle = Math.atan(observerLengthFromTheMiddle / Math.abs(sourceLengthFromTheMiddle));

    const isMovingTowards = sourceLengthFromTheMiddle > 0;

    const vSr = sourceSpeedInMetersPerSecond * Math.cos(angle);

    const adjustedSourceSpeed = isMovingTowards ? -vSr : vSr;

    const neededUnmodifiedFrequency = targetFrequency * (SPEED_OF_SOUND + adjustedSourceSpeed) / SPEED_OF_SOUND;

    return neededUnmodifiedFrequency;
};

export const positionFromStart = (msPassed: number, speedKmh: number, startPos: number) => {
    const speedMps = speedKmh / 3.6;

    const position = startPos - speedMps * msPassed / 1000;

    return position;
}
