import React from 'react';

import './EventItem.css';

const eventItem = (props) => {
	return (
		<li className="events__list-item">
			<div>
				<h1>{props.title}</h1>
				<h2>${props.price} - {new Date(props.date).toLocaleDateString('nl-NL')}</h2>
			</div>
			<div>
				{props.userId === props.creator._id ? (
					<p>This is yours</p>
				) : (
					<button className="btn" onClick={props.onDetail.bind(this, props._id)}>View details</button>
				)}
			</div>
		</li>
	);
};

export default eventItem;
