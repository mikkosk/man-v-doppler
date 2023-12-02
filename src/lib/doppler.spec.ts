import { calculateDopplerObservedFrequency } from "./doppler";

describe('doppler', () => {
    it('should calculate the observed frequency when coming towards', () => {
        const observedFrequency = calculateDopplerObservedFrequency(8000, 96, 50, 10);
        expect(observedFrequency).toBe(8660.034373703327);
    });

    it('should calculate the observed frequency when going away', () => {
        const observedFrequency = calculateDopplerObservedFrequency(8000, -96, 50, 10);
        expect(observedFrequency).toBe(7433.451068577592);
    });
});