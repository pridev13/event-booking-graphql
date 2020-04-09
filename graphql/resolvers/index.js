const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

const user = async (uId) => {
	try {
		const user = await User.findById(uId);
		return {
			...user._doc,
			password: null,
			createdEvents: events.bind(this, user._doc.createdEvents),
		};
	} catch (err) {
		throw err;
	}
};

const events = async (evIds) => {
	try {
		const results = await Event.find({_id: {$in: evIds}});

		return results.map((ev) => {
			return {
				...ev._doc,
				date: formatDate.bind(this, ev._doc.date),
				creator: user.bind(this, ev._doc.creator),
			};
		});
	} catch (err) {
		throw err;
	}
};

const singleEvent = async (evId) => {
	try {
		const event = await Event.findById(evId);
		return {
			...event._doc,
			date: formatDate.bind(this, event._doc.date),
			creator: user.bind(this, event._doc.creator),
		};
	} catch (err) {
		throw err;
	}
};

const formatDate = (date) => {
	return new Date(date).toISOString();
};

module.exports = {
	events: async () => {
		try {
			const events = await Event.find();

			return events.map((ev) => {
				return {
					...ev._doc,
					date: formatDate.bind(this, ev._doc.date),
					creator: user.bind(this, ev._doc.creator),
				};
			});
		} catch (err) {
			throw err;
		}
	},
	bookings: async () => {
		try {
			const bookings = await Booking.find();
			return bookings.map((bk) => {
				return {
					...bk._doc,
					user: user.bind(this, bk._doc.user),
					event: singleEvent.bind(this, bk._doc.event),
					createdAt: formatDate.bind(this, bk._doc.createdAt),
					updatedAt: formatDate.bind(this, bk._doc.updatedAt),
				};
			});
		} catch (err) {
			throw err;
		}
	},
	createEvent: async (args) => {
		const event = new Event({
			title: args.eventInput.title,
			description: args.eventInput.description,
			price: +args.eventInput.price,
			date: new Date(args.eventInput.date),
			creator: '5e8dc157ba78660aba022698',
		});

		try {
			const createdEvent = await event.save();
			const creator = await User.findById('5e8dc157ba78660aba022698');
			if (!creator) {
				throw new Error('User not found');
			}
			creator.createdEvents.push(event);
			await creator.save();
			return {
				...createdEvent._doc,
				date: formatDate.bind(this, createdEvent._doc.date),
				creator: user.bind(this, createdEvent._doc.creator),
			};
		} catch (err) {
			throw err;
		}
	},
	createUser: async (args) => {
		try {
			const exisUser = await User.findOne({email: args.userInput.email});
			if (exisUser) {
				throw new Error('User already exists');
			}

			const hPass = await bcrypt.hash(args.userInput.password, 12);
			const user = new User({
				email: args.userInput.email,
				password: hPass,
			});

			const res = await user.save();
			return {...res._doc, password: null};
		} catch (err) {
			throw err;
		}
	},
	bookEvent: async (args) => {
		try {
			const event = await Event.findById(args.eventId);
			if (!event) {
				throw new Error('Event not found');
			}

			const booking = new Booking({
				user: '5e8dc157ba78660aba022698',
				event: event,
			});

			const result = await booking.save();
			return {
				...result._doc,
				user: user.bind(this, result._doc.user),
				event: singleEvent.bind(this, result._doc.event),
				createdAt: formatDate.bind(this, result._doc.createdAt),
				updatedAt: formatDate.bind(this, result._doc.updatedAt),
			};
		} catch (err) {
			throw err;
		}
	},
	cancelBooking: async (args) => {
		try {
			const booking = await Booking.findById(args.bookingId).populate('event');

			if (!booking) {
				throw new Error('Booking not found');
			}
			
			const event = {
				...booking.event._doc,
				creator: user.bind(this, booking.event._doc.creator),
				date: formatDate.bind(this, booking.event._doc.date),
			};

			await Booking.deleteOne({_id: args.bookingId});

			return event;

		} catch (err) {
			throw err;
		}
	},
};
