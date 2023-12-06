import type { GameState } from "./types";

export const getText = (gameState: GameState, countdown: number, similarity: number) => {

    switch(gameState) {
        case "start_idle":
            return "Beat the Doppler";
        case "listen":
            return "Listen to the sound";
        case "countdown":
            return `Ready in ${countdown}`
        case "play":
            return "Play!";
        case "next_level_idle":
            return `Great job! Got ${similarity.toFixed(2)}% similarity. Next level?`;
        case "end_idle":
            return `Not quite good enough.\nGot ${Math.floor(similarity * 100).toFixed(0)}% similarity. Needed 95%.\nTry again?`;
        case "game_win":
            return `You truly beat the Doppler!`;
    }
}

export const infoText = `
    The life of a professional musician is busy. Only logical thing to do to save time is to never getting out of your vehicle.
    \nThe only challenge? Doppler effect.
    \nListen to the target music and repeat it as accurately as possible.
`;