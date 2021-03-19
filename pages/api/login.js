import { knex } from "../../lib/db";

const bcrypt = require("bcrypt");
const assert = require("assert");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

export default async function handler(req, res) {
	if (req.method === "POST") {
		const email = req.body.email;
		const password = req.body.password;
		//validate email and password is filled
		try {
			assert.notEqual(null, req.body.email, "Email required");
			assert.notEqual(null, req.body.password, "Password required");
		} catch (error) {
			return res
				.status(403)
				.json({ status: 403, message: error.message });
		}
		//get user based on email
		let user = await getUser(email, password);
		if (user) {
			//check if password match hash
			let match = await authenticate(email, password, user.password);
			if (match) {
				//generate token
				let token = jwt.sign(
					{ id: user.id, email: user.email },
					jwtSecret,
					{
						expiresIn: 3000, //50 minutes
					}
				);
				return res.status(200).json({ status: 200, token: token });
			} else {
				res.status(401).json({
					status: 401,
					message: "Wrong Email or Password",
				});
				return;
			}
		} else {
			res.status(401).json({
				status: 401,
				message: "Wrong Email or Password",
			});
			return;
		}
	} else {
		return res.status(500).json({ status: 500 });
	}
}

function getUser(email, password) {
	return knex("user").where({ email: email }).first();
}
function authenticate(email, password, hash) {
	return new Promise((resolve, reject) => {
		bcrypt.compare(password, hash, function (err, isMatch) {
			if (err) {
				reject(err);
			}
			resolve(isMatch);
		});
	});
}
