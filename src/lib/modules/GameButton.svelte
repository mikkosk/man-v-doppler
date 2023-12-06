<script lang="ts">
	import type { GameState } from "$lib/types";

    export let gameState: GameState = "start_idle";
    export let currentLevel: number;
    export let setNextLevel: (level: number) => void;

    const getButtonInfo = (gameState: GameState) => {
        switch(gameState) {
            case "start_idle":
                return {
                    text: "Start",
                    disabled: false,
                    nextLevel: 1
                }
            case "next_level_idle":
                return {
                    text: "Next Level",
                    disabled: false,
                    nextLevel: currentLevel + 1
                }
            case "game_win":
            return {
                    text: "Play Again",
                    disabled: false,
                    nextLevel: 1
                
                }
            case "end_idle":
                return {
                    text: "Try Again",
                    disabled: false,
                    nextLevel: currentLevel
                
                }
            case "listen":
            case "countdown":
            case "play":
                return {
                    text: `Level ${currentLevel}`,
                    disabled: true,
                    nextLevel: currentLevel + 1
                }

            
        }
    }



    $: buttonInfo = getButtonInfo(gameState);

    const handleClick = () => {
        setNextLevel(buttonInfo.nextLevel);
    }
</script>

<style>
    .game-button {
		border: none;
    border-radius: 0;
    font-family: monospace;
    font-size: xx-large;
    padding: 8px 24px;
    font-weight: 800;
    background-color: #318218;
    color: white;
    cursor: pointer;
	}

    .game-button:disabled {
        background-color: skyblue;
        cursor: not-allowed;
        color: black;
    }

    .game-button:hover:not(:disabled) {
        background-color: #234b16
    }

    
</style>

<button class="game-button" on:click={handleClick} disabled={buttonInfo.disabled} >
    {buttonInfo.text}
</button>