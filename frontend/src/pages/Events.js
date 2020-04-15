import React, {Component} from 'react';
import AuthContext from '../context/auth-context';
import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import EventList from '../components/Events/EventList';
import Spinner from '../components/Spinner/Spinner';

import './Events.css';

class EventsPage extends Component {
	state = {
		creating: false,
		events: [],
		isLoading: false,
		selectedEvent: null,
	};

	isActive = true;

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

	componentWillUnmount() {
		this.isActive = false;
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
				mutation CreateEvent($title: String!, $desc: String!, $price: Float!, $date: String!) {
					createEvent(eventInput: {title: $title, description: $desc, price: $price, date: $date}) {
						_id
						title
						description
						date
						price
					}
				}
				`,
				variables: {
					title: title,
					desc: description,
					price: price,
					date: date
				}
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

				this.setState((prevState) => {
					const updEvents = [...prevState.events];
					updEvents.push({
						_id: data.data.createEvent._id,
						title: data.data.createEvent.title,
						description: data.data.createEvent.description,
						date: data.data.createEvent.date,
						price: data.data.createEvent.price,
						creator: {
							_id: this.context.userId,
						},
					});
					return {events: updEvents};
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};

	modalCancelHandler = () => {
		this.setState({creating: false, selectedEvent: null});
	};

	fetchEvents = () => {
		this.setState({isLoading: true});

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
				if (this.isActive) {
					this.setState({events: events, isLoading: false});
				}
			})
			.catch((err) => {
				console.log(err);
				if (this.isActive) {
					this.setState({isLoading: false});
				}
			});
	};

	bookEventHandler = () => {
		if (!this.context.token) {
			this.setState({selectedEvent: null});
			return;
		}

		const reqBody = {
			query: `
				mutation BookEvent($id: ID!) {
					bookEvent(eventId: $id) {
						_id
						createdAt
						updatedAt
					}
				}
				`,
				variables: {
					id: this.state.selectedEvent._id
				}
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
				this.setState({selectedEvent: null});
			})
			.catch((err) => {
				console.log(err);
			});
	};

	showDetailHandler = (evId) => {
		this.setState((prevState) => {
			const selectedEvent = prevState.events.find((e) => e._id === evId);
			return {selectedEvent: selectedEvent};
		});
	};

	render() {
		return (
			<React.Fragment>
				{this.state.creating && (
					<React.Fragment>
						<Backdrop />
						<Modal
							title="Add event"
							onCancel={this.modalCancelHandler}
							onConfirm={this.modalConfirmHandler}
							confirmText="Confirm"
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

				{this.state.selectedEvent && (
					<React.Fragment>
						<Backdrop />
						<Modal
							title={this.state.selectedEvent.title}
							onCancel={this.modalCancelHandler}
							onConfirm={this.bookEventHandler}
							confirmText="Book"
							canCancel
							canConfirm={this.context.token !== null}
						>
							<h2>
								${this.state.selectedEvent.price} -{' '}
								{new Date(this.state.selectedEvent.date).toLocaleDateString(
									'nl-NL'
								)}
							</h2>
							<p>{this.state.selectedEvent.description}</p>
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

				{this.state.isLoading ? (
					<Spinner />
				) : (
					<EventList
						events={this.state.events}
						authUserId={this.context.userId}
						onViewDetail={this.showDetailHandler}
					/>
				)}
			</React.Fragment>
		);
	}
}

export default EventsPage;
