import React from 'react';

import './BookingList.css';

const bookingList = (props) => {
	return (
		<ul className="bookings__list">
			{props.bookings.map((bk) => {
				return (
					<li key={bk._id} className="bookings__item">
						<div className="bookings__item-data">
							{bk.event.title} - {}
							{new Date(bk.createdAt).toLocaleDateString()}
						</div>
						<div className="bookings__item-actions">
							<button className="btn" onClick={props.onDelete.bind(this, bk._id)}>Cancel</button>
						</div>
					</li>
				);
			})}
		</ul>
	);
};

export default bookingList;
