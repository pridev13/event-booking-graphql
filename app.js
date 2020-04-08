const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const {buildSchema} = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.use(
	'/graphql',
	graphqlHttp({
		schema: buildSchema(`
			type Event {
				_id: ID!
				title: String!
				description: String!
				price: Float!
				date: String!
			}

			input EventInput {
				title: String!
				description: String!
				price: Float!
				date: String!
			}

			type User {
				_id: ID!
				email: String!
				password: String
			}

			input UserInput {
				email: String!
				password: String!
			}

			type RootQuery {
				events: [Event!]!
			}

			type RootMutation {
				createEvent(eventInput: EventInput): Event
				createUser(userInput: UserInput): User
			}

			schema {
				query: RootQuery
				mutation: RootMutation
			}
		`),
		rootValue: {
			events: () => {
				return Event.find()
					.then((events) => {
						return events.map((ev) => {
							return {...ev._doc};
						});
					})
					.catch((err) => {
						throw err;
					});
			},
			createEvent: (args) => {
				const event = new Event({
					title: args.eventInput.title,
					description: args.eventInput.description,
					price: +args.eventInput.price,
					date: new Date(args.eventInput.date),
					creator: '5e8dc157ba78660aba022698',
				});

				let createdEvent;

				return event
					.save()
					.then((res) => {
						createdEvent = res;
						return User.findById('5e8dc157ba78660aba022698');
					})
					.then((user) => {
						if(!user) {
							throw new Error('User not found');
						}
						user.createdEvents.push(event);
						return user.save();
					})
					.then((res) => {
						console.log(createdEvent);
						return {...createdEvent._doc};
					})
					.catch((err) => {
						console.log(err);
						throw err;
					});
			},
			createUser: (args) => {
				return User.findOne({email: args.userInput.email})
					.then((user) => {
						if (user) {
							throw new Error('User already exists');
						}

						return bcrypt.hash(args.userInput.password, 12);
					})
					.then((hPass) => {
						const user = new User({
							email: args.userInput.email,
							password: hPass,
						});

						return user.save();
					})
					.then((res) => {
						return {...res._doc, password: null};
					})
					.catch((err) => {
						throw err;
					});
			},
		},
		graphiql: true,
	})
);

app.get('/', (req, res, next) => {
	res.send('Hi!');
});

mongoose
	.connect(
		`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-fqjlx.gcp.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
	)
	.then(() => {
		const PORT = process.env.PORT || 3000;
		app.listen(PORT);
	})
	.catch((err) => {
		console.warn(err);
	});
