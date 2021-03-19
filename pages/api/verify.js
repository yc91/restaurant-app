const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

export default async function handler(req, res) {
	if (!("token" in req.cookies)) {
		return res.status(403).json({ status: 403 });
	}
	let decoded;
	let token = req.cookies.token;
	if (token) {
		try {
			decoded = jwt.verify(token, jwtSecret);

			if (decoded) {
				return res.status(200).json({ status: 200, user: decoded });
			} else {
				return res.status(401).json({ status: 401 });
			}
		} catch (e) {
			return res.status(401).json({ status: 401 });
		}
	}
}
