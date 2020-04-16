import React from 'react';

import './BookingsControls.css';

const bookingsControls = (props) => {
	return (
		<div className="bookings-controls">
			<button
				className={props.activeType === 'list' ? 'active' : ''}
				onClick={props.onSwitch.bind(this, 'list')}
			>
				List
			</button>
			<button
				className={props.activeType === 'chart' ? 'active' : ''}
				onClick={props.onSwitch.bind(this, 'chart')}
			>
				Chart
			</button>
		</div>
	);
};

export default bookingsControls;
