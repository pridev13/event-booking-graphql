import React, {Component} from 'react';

import AuthContext from '../context/auth-context';

import './Auth.css';

class AuthPage extends Component {
	state = {
		isLogin: true,
	};

	static contextType = AuthContext;

	constructor(props) {
		super(props);
		this.emailEl = React.createRef();
		this.passwordEl = React.createRef();
	}

	submitHandler = (ev) => {
		ev.preventDefault();

		const email = this.emailEl.current.value;
		const password = this.passwordEl.current.value;

		if (email.trim().length === 0 || password.trim().length === 0) {
			return;
		}

		let reqBody = {
			query: `
				query Login($email: String!, $password: String!) {
					login(email: $email, password: $password) {
						userId
						token
						tokenExp
					}
				}
			`,
			variables: {
				email: email,
				password: password,
			},
		};

		if (!this.state.isLogin) {
			reqBody = {
				query: `
				mutation CreateUser($email: String!, $password: String!) {
					createUser(userInput: {email: $email, password: $password}) {
						_id
						email
					}
				}
				`,
				variables: {
					email: email,
					password: password,
				},
			};
		}

		fetch('http://localhost:5000/graphql', {
			method: 'POST',
			body: JSON.stringify(reqBody),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => {
				if (res.status !== 200 && res.status !== 201) {
					throw new Error('Failed with status ' + res.status);
				}
				return res.json();
			})
			.then((data) => {
				if (data.data.login.token) {
					this.context.login(
						data.data.login.token,
						data.data.login.userId,
						data.data.login.tokenExp
					);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	switchMode = () => {
		this.setState((prevState) => {
			return {
				isLogin: !prevState.isLogin,
			};
		});
	};

	render() {
		return (
			<form className="auth-form" onSubmit={this.submitHandler}>
				<div className="form-control">
					<label htmlFor="email">E-mail</label>
					<input type="email" id="email" ref={this.emailEl} />
				</div>
				<div className="form-control">
					<label htmlFor="password">Password</label>
					<input type="password" id="password" ref={this.passwordEl} />
				</div>
				<div className="form-actions">
					<button type="submit">Submit</button>
					<button type="button" onClick={this.switchMode}>
						Switch to {this.state.isLogin ? 'sign up' : 'login'}
					</button>
				</div>
			</form>
		);
	}
}

export default AuthPage;
