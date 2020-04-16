import React, {Component} from 'react';
import AuthContext from '../context/auth-context';
import BookingList from '../components/Bookings/BookingList';
import BookingsChart from '../components/Bookings/BookingsChart';
import BookingsControl from '../components/Bookings/BookingsControls';
import Spinner from '../components/Spinner/Spinner';

class BookingsPage extends Component {
	state = {
		isLoading: false,
		bookings: [],
		type: 'list',
	};

	static contextType = AuthContext;

	componentDidMount() {
		this.fetchBookings();
	}

	fetchBookings = () => {
		this.setState({isLoading: true});

		const reqBody = {
			query: `
				query {
					bookings {
						_id
						createdAt
						event {
							_id
							title
							date
							price
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
				const bookings = data.data.bookings;
				this.setState({bookings: bookings, isLoading: false});
			})
			.catch((err) => {
				console.log(err);
				this.setState({isLoading: false});
			});
	};

	deleteBookingHandler = (bkId) => {
		this.setState({isLoading: true});

		const reqBody = {
			query: `
				mutation CancelBooking($id: ID!) {
					cancelBooking(bookingId: $id) {
						_id
						title
					}
				}
				`,
			variables: {
				id: bkId,
			},
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
					const updBookings = prevState.bookings.filter((bk) => {
						return bk._id !== bkId;
					});

					return {bookings: updBookings, isLoading: false};
				});
			})
			.catch((err) => {
				console.log(err);
				this.setState({isLoading: false});
			});
	};

	switchHandler = (type) => {
		if (type !== this.state.type) {
			this.setState({type: type});
		}
	};

	render() {
		let content = <Spinner />;
		if (!this.state.isLoading) {
			content = (
				<React.Fragment>
					<BookingsControl
						activeType={this.state.type}
						onSwitch={this.switchHandler}
					/>
					<div>
						{this.state.type === 'list' ? (
							<BookingList
								bookings={this.state.bookings}
								onDelete={this.deleteBookingHandler}
							/>
						) : (
							<BookingsChart bookings={this.state.bookings} />
						)}
					</div>
				</React.Fragment>
			);
		}
		return <React.Fragment>{content}</React.Fragment>;
	}
}

export default BookingsPage;
