import { line, scaleLinear, curveLinear} from 'd3';

const Y_DOMAIN = [0, 1000];

export const generateSvg = (frequencyArrayFull: {time: number, value: number}[], MAX_TIME: number, width: number, height: number,margin: {bottom: number, top: number, left: number, right: number}) => {
		const xScale = scaleLinear()
			.domain([0, MAX_TIME])
			.range([margin.left, width - margin.right]);

	 const yScale = scaleLinear()
			.domain(Y_DOMAIN) // We care about the 1000 Hz range
			.range([height - margin.bottom, margin.top]);

		const pathGenerator = line<{time: number, value: number}>()
			.x((f) => xScale(f.time))
			.y((f) => yScale(f.value))
			.curve(curveLinear);

		const linePath = pathGenerator(frequencyArrayFull);
		const yAxisPath = line<number>().x(0).y((d) => yScale(d))(Y_DOMAIN);
		const yTicks = yScale.ticks(10).map((d) => {
			const value = yScale(d);
			const label = d;

			return { value, label };
		}
			)
			;

		return {
			linePath,
			yAxisPath,
			yTicks
		}
	};