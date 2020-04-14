import React from 'react';
import EventItem from './EventItem';

import './EventList.css';

const eventList = (props) => {
	const events = props.events.map((ev) => {
		return (
			<EventItem
				key={ev._id}
				{...ev}
				userId={props.authUserId}
				onDetail={props.onViewDetail}
			/>
		);
	});

	return <ul className="event__list">{events}</ul>;
};

export default eventList;
