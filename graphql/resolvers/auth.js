const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');
const {formatUser} = require('./helper');

module.exports = {
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
			return formatUser(res);
		} catch (err) {
			throw err;
		}
	},
	login: async ({email, password}) => {
		const user = await User.findOne({email: email});
		if (!user) {
			throw new Error('User does not exist');
		}

		const isEqual = await bcrypt.compare(password, user.password);
		if (!isEqual) {
			throw new Error('Incorrect password');
		}

		const token = jwt.sign({userId: user.id, email: user.email}, 'thiskeyissecret', {
			expiresIn: '1h'
		});

		return {
			userId: user.id,
			token,
			tokenExp: 1
		}
	},
};
