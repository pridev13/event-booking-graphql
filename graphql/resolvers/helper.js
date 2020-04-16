const DataLoader = require('dataloader');

const User = require('../../models/user');
const Event = require('../../models/event');

const eventLoader = new DataLoader((eventIds) => {
	return events(eventIds);
});

const userLoader = new DataLoader((uIds) => {
	return User.find({_id: {$in: uIds}});
});

const user = async (uId) => {
	try {
		const user = await userLoader.load(uId.toString());
		return formatUser(user);
	} catch (err) {
		throw err;
	}
};

const events = async (evIds) => {
	try {
		const results = await Event.find({_id: {$in: evIds}});
		results.sort((a, b) => {
			return evIds.indexOf(a._id.toString()) - evIds.indexOf(b._id.toString());
		});

		return results.map((ev) => {
			return formatEvent(ev);
		});
	} catch (err) {
		throw err;
	}
};

const singleEvent = async (evId) => {
	try {
		const event = await eventLoader.load(evId.toString());
		return event;
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
		createdEvents: () => eventLoader.loadMany(user._doc.createdEvents),
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
