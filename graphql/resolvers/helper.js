const User = require('../../models/user');
const Event = require('../../models/event');

const user = async (uId) => {
	try {
		const user = await User.findById(uId);
		return formatUser(user);
	} catch (err) {
		throw err;
	}
};

const events = async (evIds) => {
	try {
		const results = await Event.find({_id: {$in: evIds}});

		return results.map((ev) => {
			return formatEvent(ev);
		});
	} catch (err) {
		throw err;
	}
};

const singleEvent = async (evId) => {
	try {
		const event = await Event.findById(evId);
		return formatEvent(event);
	} catch (err) {
		throw err;
	}
};

const formatDate = (date) => {
	return new Date(date).toISOString();
};

const formatEvent = (event) => {
	return {
		...event._doc,
		date: formatDate.bind(this, event._doc.date),
		creator: user.bind(this, event._doc.creator),
	};
};

const formatUser = (user) => {
	return {
		...user._doc,
		password: null,
		createdEvents: events.bind(this, user._doc.createdEvents),
	};
};

const formatBooking = (bk) => {
	return {
		...bk._doc,
		user: user.bind(this, bk._doc.user),
		event: singleEvent.bind(this, bk._doc.event),
		createdAt: formatDate.bind(this, bk._doc.createdAt),
		updatedAt: formatDate.bind(this, bk._doc.updatedAt),
	};
};

exports.formatEvent = formatEvent;
exports.formatUser = formatUser;
exports.formatBooking = formatBooking;
