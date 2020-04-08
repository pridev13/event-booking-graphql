const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const {buildSchema} = require('graphql');

const app = express();

app.use(bodyParser.json());

app.use(
	'/graphql',
	graphqlHttp({
		schema: buildSchema(`
			type RootQuery {
				events: [String!]!
			}

			type RootMutation {
				createEvent(name: String): String
			}

			schema {
				query: RootQuery
				mutation: RootMutation
			}
		`),
		rootValue: {
			events: () => {
				return [
					'Event 1',
					'Event 2',
					'Event 3',
				]
			},
			createEvent: (args) => {
				const eventName = args.name;
				return eventName;
			}
		},
		graphiql: true
	})
);

app.get('/', (req, res, next) => {
	res.send('Hi!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
