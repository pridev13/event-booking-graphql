const bcrypt = require('bcryptjs');
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
};
