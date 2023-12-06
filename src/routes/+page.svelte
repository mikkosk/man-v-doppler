<script lang="ts">
	import {
		calculateDopplerObservedFrequency,
		calculateNeededUnmodifiedFrequency,
		positionFromStart
	} from '$lib';
	import GameButton from '$lib/modules/GameButton.svelte';
	import Car from '$lib/modules/svgs/Car.svelte';
	import BackgroundForest from '$lib/modules/svgs/BackgroundForest.svelte';
	import BackgroundRoad from '$lib/modules/svgs/BackgroundRoad.svelte';
	import { calculateSimilarity } from '$lib/similarity';
	import { generateSvg } from '$lib/svg';
	import { createTargetArrayFromSeedPoints } from '$lib/tools';
	import type { GameState } from '$lib/types';
	import { DOMAIN_MAX, INTERVAL_MS, MAX_HERZ, MIN_HERZ } from '$lib/variables';
	import { getText, infoText } from '$lib/texts';
	import { allLevels } from '$lib/levels';

	$: innerWidth = 600;
	$: width = Math.min(innerWidth, 600);

	let margin = { top: 0, bottom: 0, left: 0, right: 0 };
	$: height = width * 0.8;

	const BACKGROUND_FOREST_HEIGHT_FACTOR = 7 / 16;
	const BACKGROUND_ROAD_HEIGHT_FACTOR = 9 / 16;
	$: FOREST_HEIGHT = height * BACKGROUND_FOREST_HEIGHT_FACTOR;
	$: ROAD_HEIGHT = height * BACKGROUND_ROAD_HEIGHT_FACTOR;
	$: CAR_HEIGHT = 0.0875 * height;
	$: CAR_WIDTH = 0.2 * height;

	const OBSERVER_POS = 10;

	let similarity: number | undefined = undefined;
	let countdown: number | undefined = undefined;

	let gameState: GameState = 'start_idle';
	
	let currentLevel = 1;
	let level = allLevels[currentLevel - 1];

	
	let currentPos = level.distanceFromMiddle;

	let frequencyArray: { time: number; value: number }[] = [];
	let targetArray = createTargetArrayFromSeedPoints(level.speed, level.seedPoints, INTERVAL_MS, level.maxTime);

	const getStartHerz = () => {
		return calculateNeededUnmodifiedFrequency(
			targetArray[0]?.value || 400,
			level.speed,
			level.distanceFromMiddle,
			OBSERVER_POS
		);
	};

	let herz = getStartHerz();
	let interval_number = 0;

	let oscillator: OscillatorNode;
	let audioContext: AudioContext;

	const playTarget = () => {
		audioContext = new AudioContext();
		oscillator = audioContext.createOscillator();
		oscillator.connect(audioContext.destination);
		oscillator.start();
		interval_number = 1;
		oscillator.frequency.setValueAtTime(targetArray[0]?.value || 400, audioContext.currentTime);
		gameState = 'listen';
		playTargetInterval();
	};

	const playTargetInterval = () => {
		const interval = setInterval(() => {
			const soundToBePlayed = targetArray[interval_number];

			if (soundToBePlayed == undefined) {
				oscillator.stop();
				interval_number = 0;
				clearInterval(interval);
				gameState = 'countdown';
				startCountdown();
				return;
			}

			oscillator.frequency.setValueAtTime(soundToBePlayed.value, audioContext.currentTime);
			interval_number += 1;
		}, INTERVAL_MS);
	};

	const countdownInterval = () => {
		const cdInterval = setInterval(() => {
			if (countdown == undefined) {
				clearInterval(cdInterval);
				return;
			}

			if (countdown <= 0) {
				clearInterval(cdInterval);
				gameState = 'play';
				startPlaying();
				return;
			}

			countdown -= 1;
		}, 1000);
	};

	const startPlaying = () => {
		audioContext = new AudioContext();
		oscillator = audioContext.createOscillator();
		oscillator.connect(audioContext.destination);
		oscillator.start();

		const herzAtStart = targetArray[0]?.value || 400;
		oscillator.frequency.setValueAtTime(herzAtStart, audioContext.currentTime);
		savePlayedInterval();
	};

	const savePlayedInterval = () => {
		interval_number = 0;
		const pInterval = setInterval(() => {
			const time = interval_number * INTERVAL_MS;
			const value = oscillator.frequency.value;

			frequencyArray.push({ time, value });
			frequencyArray = frequencyArray;

			currentPos = positionFromStart(interval_number * INTERVAL_MS, level.speed, level.distanceFromMiddle);

			interval_number += 1;

			if (interval_number * INTERVAL_MS > level.maxTime) {
				oscillator.stop();
				clearInterval(pInterval);
				similarity = calculateSimilarity(targetArray, frequencyArray);
				if (similarity && similarity > 0.9) {
					gameState = currentLevel === allLevels.length ? "game_win" : 'next_level_idle';
				} else {
					gameState = 'end_idle';
				}
			}
		}, INTERVAL_MS);
	};

	const startCountdown = () => {
		frequencyArray = [];
		countdown = 3;
		countdownInterval();
		similarity = undefined;
	};

	const changeHerz = (newHerz: number) => {
		herz = newHerz;
	};


	// Set position to start, get new starting frequency, remove old frequency array
	const changeLevel = () => {
		if(currentLevel > allLevels.length) {
			gameState = 'game_win';
			return;
		}
		const newLevel = allLevels[currentLevel - 1];
		level = newLevel;
		currentPos = level.distanceFromMiddle; 
		targetArray = createTargetArrayFromSeedPoints(level.speed, level.seedPoints, INTERVAL_MS, level.maxTime);
		changeHerz(getStartHerz());
		frequencyArray = [];
	};


	const startNewLevel = (levelNumber: number) => {
		currentLevel = levelNumber;
		changeLevel();
		playTarget();
	};


	const updateObservedHerz = (currentHerz: number, position: number) => {
		const observedHerz = calculateDopplerObservedFrequency(
			currentHerz,
			level.speed,
			position,
			OBSERVER_POS
		);
		oscillator?.frequency.setValueAtTime(observedHerz, audioContext.currentTime);
	};

	$: {
		updateObservedHerz(herz, currentPos);
	}
	$: adjustedHerz = calculateDopplerObservedFrequency(herz, level.speed, currentPos, OBSERVER_POS);

	$: svg = generateSvg(frequencyArray, level.maxTime, width, ROAD_HEIGHT, margin);
	$: targetSvg = generateSvg(targetArray, level.maxTime, width, ROAD_HEIGHT, margin);
	$: svgCarPosX =
		((interval_number * INTERVAL_MS) / level.maxTime) * (width - margin.left - margin.right) +
		margin.left;
	$: svgCarPosY = height - (adjustedHerz / DOMAIN_MAX) * ROAD_HEIGHT - CAR_HEIGHT / 2;

	$: RESULT_SHOWING = ['next_level_idle', 'end_idle'].includes(gameState);
	$: changingText = getText(gameState, countdown || 0, similarity || 0);
</script>

<svelte:window bind:innerWidth />
<div class="page_container">
<div class="main_container">
	<div class="controls">
		
		<div class="changing_text_container">
			<span class="changing_text" >{changingText}</span>
		</div>

		<GameButton {gameState} {currentLevel} setNextLevel={startNewLevel} />

		{#if gameState === "start_idle"}
			<span class="info_text" style="margin-bottom: 24px;">{infoText}</span>
		{:else}
		<div class="input_container">
			<div class="input_info_container">
				<span class="info_text">Lower sound</span>
				<span class="info_text">Higher sound</span>
			</div>

			<input
				class="herz_input"
				type="range"
				min={MIN_HERZ}
				max={MAX_HERZ}
				bind:value={herz}
				on:input={() => changeHerz(herz)}
				disabled={gameState !== 'play'}
			/>
		</div>
		<div class="level_info_container">
			<span class="info_text">Level {currentLevel}</span>
			<span class="info_text">Car velocity: {level.speed}km/h</span>
			<span class="info_text">Observer distance from middle: {OBSERVER_POS}m</span>
		</div>
		{/if}
	</div>
	<div style="display: flex">
		<svg {height} {width}>
			<BackgroundForest posX={0} posY={0} {width} height={FOREST_HEIGHT} />
			<BackgroundRoad
				posX={0}
				posY={FOREST_HEIGHT}
				{width}
				height={height * BACKGROUND_ROAD_HEIGHT_FACTOR}
			/>
			<Car posX={svgCarPosX} posY={svgCarPosY} width={CAR_WIDTH} height={CAR_HEIGHT} />
			{#if RESULT_SHOWING}
				<svg y={FOREST_HEIGHT}>
					<!-- line -->
					<path
						d={targetSvg.linePath}
						fill="none"
						style={`stroke-width: 10px;
				stroke-linejoin: bevel;
				stroke: rgb(139, 1, 1, 0.6);`}
					/>
				</svg>
			{/if}
			<svg y={FOREST_HEIGHT}>
				<!-- line -->
				<path
					d={svg.linePath}
					fill="none"
					style={`stroke-width: 10px;
				stroke-linejoin: bevel;
				stroke: rgb(1, 1, 1, 0.3);`}
				/>
			</svg>
		</svg>
	</div>
</div>
</div>

<style>
	.info_text {
		font-family: monospace;
		font-size: large;
		display: inline-block;
		white-space: pre-line;
	}

	.changing_text_container {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		min-height: 100px;
	}

	.changing_text {
		font-family: monospace;
		font-size: xx-large;
		display: inline-block;
		white-space: pre-line;
		font-weight: bold;
		text-align: center;
	}

	@media (max-width: 800px) {
		.changing_text {
			font-size: x-large;
		}
	}

	.controls {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 16px 16px 0 16px;
		gap: 24px;
		width: 100%;
		box-sizing: border-box;
	}

	.page_container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
	}

	.main_container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: skyblue;
		max-width: 600px;
	}

	.herz_input {
		max-width: 800px;
	}

	.input_container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		max-width: 800px;
	}

	.input_info_container {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}

	.level_info_container {
		display: flex;
		flex-direction: column;
		gap: 4px;
		align-self: baseline;
	}

	/********** Range Input Styles **********/
	/*Range Reset*/
	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		background: transparent;
		cursor: pointer;
		width: 100%;
	}

	input:disabled {
		cursor: not-allowed;
	}

	/* Removes default focus */
	input[type='range']:focus {
		outline: none;
	}

	/***** Chrome, Safari, Opera and Edge Chromium styles *****/
	/* slider track */
	input[type='range']::-webkit-slider-runnable-track {
		background-color: rgb(153, 153, 153);
		height: 16px;
	}

	/* slider thumb */
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none; /* Override default look */
		appearance: none;
		margin-top: -4px; /* Centers thumb on the track */

		/*custom styles*/
		background-color: rgb(179, 51, 26);
		height: 24px;
		width: 16px;
	}
	input[type='range']:disabled::-webkit-slider-thumb {
		background-color: rgb(0, 0, 0);
	}

	input[type='range']:focus::-webkit-slider-thumb {
		border: 'none';
	}

	/******** Firefox styles ********/
	/* slider track */
	input[type='range']::-moz-range-track {
		background-color: rgb(153, 153, 153);
		height: 16px;
	}

	/* slider thumb */
	input[type='range']::-moz-range-thumb {
		border: none; /*Removes extra border that FF applies*/
		border-radius: 0; /*Removes default border-radius that FF applies*/

		/*custom styles*/
		background-color: rgb(179, 51, 26);
		height: 24px;
		width: 16px;
	}

	input[type='range']:disabled::-moz-range-thumb {
		background-color: rgb(0, 0, 0);
	}

	input[type='range']:focus::-moz-range-thumb {
		border: 'none';
	}
</style>
