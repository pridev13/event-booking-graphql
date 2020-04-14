import React, {Component} from 'react';
import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';

import './Events.css';

class EventsPage extends Component {
	state = {
		creating: false,
	};

	startCreateEventHandler = () => {
		this.setState({creating: true});
	};

	modalConfirmHandler = () => {
		this.setState({creating: false});
	};

	modalCancelHandler = () => {
		this.setState({creating: false});
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
							canCancel
							canConfirm
						>
							test
						</Modal>
					</React.Fragment>
				)}
				<div className="events-control">
					<p>Create our own event</p>
					<button className="btn" onClick={this.startCreateEventHandler}>
						Create event
					</button>
				</div>
			</React.Fragment>
		);
	}
}

export default EventsPage;
