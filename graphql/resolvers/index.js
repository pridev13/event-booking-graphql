const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');

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
				date: new Date(ev._doc.date).toISOString(),
				creator: user.bind(this, ev._doc.creator),
			};
		});
	} catch (err) {
		throw err;
	}
};

module.exports = {
	events: async () => {
		try {
			const events = await Event.find();

			return events.map((ev) => {
				return {
					...ev._doc,
					date: new Date(ev._doc.date).toISOString(),
					creator: user.bind(this, ev._doc.creator),
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
				date: new Date(createdEvent._doc.date).toISOString(),
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
};
