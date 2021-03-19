import { knex } from "../../lib/db";

const bcrypt = require("bcrypt");
const assert = require("assert");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const saltRounds = 10;

export default async function handler(req, res) {
	if (req.method === "POST") {
		const email = req.body.email;
		const password = req.body.password;
		const confirmPassword = req.body.confirmPassword;
		//validate inputs
		try {
			assert.notEqual(null, req.body.email, "Email required");
			assert.notEqual(null, req.body.password, "Password required");
			assert.equal(
				req.body.confirmPassword,
				req.body.password,
				"Password do not match"
			);
		} catch (error) {
			return res
				.status(403)
				.json({ status: 403, message: error.message });
		}
		//check if user exists
		let check = await checkUser(email);
		if (!check.count) {
			//create user
			let user = await createUser(email, password);
			//generate jwt token
			let token = jwt.sign({ id: user[0], email: email }, jwtSecret, {
				expiresIn: 3000, //50 minutes
			});
			return res.status(200).json({ status: 200, token: token });
		} else {
			return res
				.status(500)
				.json({
					status: 500,
					message: "This email address is already being used",
				});
		}
	} else {
		return res.status(500).json({ status: 500 });
	}
}

function checkUser(email) {
	return knex("user").where({ email: email }).count("email as count").first();
}

function createUser(email, password) {
	return new Promise((resolve, reject) => {
		// Generate and store hash from password.
		bcrypt.hash(password, saltRounds, function (err, hash) {
			knex("user")
				.insert({ email: email, password: hash })
				.then(function (row) {
					resolve(row);
				});
		});
	});
}
