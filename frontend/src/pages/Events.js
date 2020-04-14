import React, {Component} from 'react';
import AuthContext from '../context/auth-context';
import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';

import './Events.css';

class EventsPage extends Component {
	state = {
		creating: false,
		events: [],
	};

	constructor(props) {
		super(props);
		this.titleElRef = React.createRef();
		this.priceElRef = React.createRef();
		this.dateElRef = React.createRef();
		this.descElRef = React.createRef();
	}

	static contextType = AuthContext;

	componentDidMount() {
		this.fetchEvents();
	}

	startCreateEventHandler = () => {
		this.setState({creating: true});
	};

	modalConfirmHandler = () => {
		this.setState({creating: false});
		const title = this.titleElRef.current.value;
		const price = +this.priceElRef.current.value;
		const date = this.dateElRef.current.value;
		const description = this.descElRef.current.value;

		if (
			title.trim().length === 0 ||
			price <= 0 ||
			date.trim().length === 0 ||
			description.trim().length === 0
		) {
			return;
		}

		const event = {title, price, date, description};
		console.log(event);

		const reqBody = {
			query: `
				mutation {
					createEvent(eventInput: {title: "${title}", description: "${description}", price: ${price}, date: "${date}"}) {
						_id
						title
						description
						date
						price
						creator {
							_id
							email
						}
					}
				}
				`,
		};

		fetch('http://localhost:5000/graphql', {
			method: 'POST',
			body: JSON.stringify(reqBody),
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this.context.token,
			},
		})
			.then((res) => {
				if (res.status !== 200 && res.status !== 201) {
					throw new Error('Failed with status ' + res.status);
				}
				return res.json();
			})
			.then((data) => {
				console.log(data);
				this.fetchEvents();
			})
			.catch((err) => {
				console.log(err);
			});
	};

	modalCancelHandler = () => {
		this.setState({creating: false});
	};

	fetchEvents = () => {
		const reqBody = {
			query: `
				query {
					events {
						_id
						title
						description
						date
						price
						creator {
							_id
							email
						}
					}
				}
				`,
		};

		fetch('http://localhost:5000/graphql', {
			method: 'POST',
			body: JSON.stringify(reqBody),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => {
				if (res.status !== 200 && res.status !== 201) {
					throw new Error('Failed with status ' + res.status);
				}
				return res.json();
			})
			.then((data) => {
				console.log(data);
				const events = data.data.events;
				this.setState({events: events});
			})
			.catch((err) => {
				console.log(err);
			});
	};

	render() {
		const eventList = this.state.events.map((ev) => {
			return (
				<li key={ev._id} className="events__list-item">
					{ev.title}
				</li>
			);
		});

		return (
			<React.Fragment>
				{this.state.creating && (
					<React.Fragment>
						<Backdrop />
						<Modal
							title="Add event"
							onCancel={this.modalCancelHandler}
							onConfirm={this.modalConfirmHandler}
							canCancel
							canConfirm
						>
							<form>
								<div className="form-control">
									<label htmlFor="title">Title</label>
									<input
										type="text"
										name="title"
										ref={this.titleElRef}
										defaultValue="Test"
									/>
								</div>
								<div className="form-control">
									<label htmlFor="price">Price</label>
									<input
										type="number"
										name="price"
										ref={this.priceElRef}
										defaultValue="9.95"
									/>
								</div>
								<div className="form-control">
									<label htmlFor="date">Date</label>
									<input
										type="datetime-local"
										name="date"
										ref={this.dateElRef}
										defaultValue="2020-10-15T15:15"
									/>
								</div>
								<div className="form-control">
									<label htmlFor="description">Description</label>
									<textarea
										name="description"
										rows="4"
										ref={this.descElRef}
										defaultValue="It is going to be wild"
									/>
								</div>
							</form>
						</Modal>
					</React.Fragment>
				)}

				{this.context.token && (
					<div className="events-control">
						<p>Create our own event</p>
						<button className="btn" onClick={this.startCreateEventHandler}>
							Create event
						</button>
					</div>
				)}
				<ul className="events__list">{eventList}</ul>
			</React.Fragment>
		);
	}
}

export default EventsPage;
