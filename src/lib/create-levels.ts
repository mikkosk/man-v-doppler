import { createNewLevelWithSeedPoints } from "./tools"
import fs from "fs"

type LevelSeed = {
    maxTime: number, // between 3000 and 10000, multiple of 1000
    soundPoints: number, // between 3 and 150
    speed: number, // 40 and 200
}

// create 30 level seeds with increasing difficulty. The faster the speed and the more sound points, the harder the level
const levelSeeds: LevelSeed[] = [
    {
        maxTime: 5000,
        soundPoints: 3,
        speed: 60,
    },
    {
        maxTime: 6000,
        soundPoints: 5,
        speed: 70,
    },
    {
        maxTime: 7000,
        soundPoints: 7,
        speed: 80,
    },
    {
        maxTime: 8000,
        soundPoints: 8,
        speed: 90,
    },
    {
        maxTime: 9000,
        soundPoints: 9,
        speed: 100,
    },
    {
        maxTime: 3000,
        soundPoints: 10,
        speed: 110,
    },
    {
        maxTime: 5000,
        soundPoints: 11,
        speed: 120,
    },
    {
        maxTime: 7000,
        soundPoints: 12,
        speed: 130,
    },
    {
        maxTime: 8000,
        soundPoints: 13,
        speed: 140,
    },
    {
        maxTime: 9000,
        soundPoints: 14,
        speed: 150,
    },
    {
        maxTime: 6000,
        soundPoints: 15,
        speed: 160,
    },
    {
        maxTime: 4000,
        soundPoints: 16,
        speed: 170,
    },
    {
        maxTime: 10000,
        soundPoints: 17,
        speed: 180,
    },
    {
        maxTime: 5000,
        soundPoints: 18,
        speed: 190,
    },
    {
        maxTime: 7000,
        soundPoints: 19,
        speed: 200,
    }
] 


const levels = levelSeeds.map((seed) => {
    return createNewLevelWithSeedPoints(seed.speed, seed.soundPoints, seed.maxTime)
})

// write levels to file as json
fs.writeFileSync("./levels/levels.json", JSON.stringify(levels, null, 2))

