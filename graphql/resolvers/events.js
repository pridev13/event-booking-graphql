const Event = require('../../models/event');
const User = require('../../models/user');
const {formatEvent} = require('./helper');

module.exports = {
	events: async () => {
		try {
			const events = await Event.find();

			return events.map((ev) => {
				return formatEvent(ev);
			});
		} catch (err) {
			throw err;
		}
	},
	createEvent: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('Please log in');
		}

		const event = new Event({
			title: args.eventInput.title,
			description: args.eventInput.description,
			price: +args.eventInput.price,
			date: new Date(args.eventInput.date),
			creator: req.userId,
		});

		try {
			const createdEvent = await event.save();
			const creator = await User.findById(req.userId);
			if (!creator) {
				throw new Error('User not found');
			}
			creator.createdEvents.push(event);
			await creator.save();
			return formatEvent(createdEvent);
		} catch (err) {
			throw err;
		}
	},
};
