import React from 'react';
import {Bar} from 'react-chartjs';

const BOOKINGS_BUCKETS = {
	Cheap: {min: 0, max: 100},
	Normal: {min: 100, max: 200},
	Expensive: {min: 200, max: 9999999999},
};

const bookingsChart = (props) => {
	const chartData = {labels: [], datasets: []};
	let values = [];
	for (const bucket in BOOKINGS_BUCKETS) {
		const filteredBks = props.bookings.reduce((prev, curr) => {
			if (
				curr.event.price >= BOOKINGS_BUCKETS[bucket].min &&
				curr.event.price < BOOKINGS_BUCKETS[bucket].max
			) {
				return prev + 1;
			}
			return prev;
		}, 0);

		values.push(filteredBks);
		chartData.labels.push(bucket);
		chartData.datasets.push({
			fillColor: 'rgba(220,220,220,0.5)',
			strokeColor: 'rgba(220,220,220,0.8)',
			highlightColor: 'rgba(220,220,220,0.75)',
			highlightStroke: 'rgba(220,220,220,1)',
			data: values,
		});

		values = [...values];
		values[values.length - 1] = 0;
	}

	console.log(chartData);

	return <div style={{textAlign: 'center'}}><Bar data={chartData} /></div>;
};

export default bookingsChart;
