import React, {Component} from 'react';
import AuthContext from '../context/auth-context';
import Spinner from '../components/Spinner/Spinner';

class BookingsPage extends Component {
	state = {
		isLoading: false,
		bookings: [],
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

	render() {
		return (
			<React.Fragment>
				{this.state.isLoading ? (
					<Spinner />
				) : (
					<ul>
						{this.state.bookings.map((bk) => {
							return <li key={bk._id}>{bk.event.title}</li>;
						})}
					</ul>
				)}
			</React.Fragment>
		);
	}
}

export default BookingsPage;
