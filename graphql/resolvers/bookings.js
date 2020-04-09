const Booking = require('../../models/booking');
const Event = require('../../models/event');
const {formatBooking, formatEvent} = require('./helper');

module.exports = {
	bookings: async () => {
		try {
			const bookings = await Booking.find();
			return bookings.map((bk) => {
				return formatBooking(bk);
			});
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
			return formatBooking(result);
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

			const event = formatEvent(booking.event);

			await Booking.deleteOne({_id: args.bookingId});

			return event;
		} catch (err) {
			throw err;
		}
	},
};
