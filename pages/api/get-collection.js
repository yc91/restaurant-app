import { knex } from "../../lib/db";

export default async function handler(req, res) {
	if (req.method === "POST") {
		const userId = req.body.user;

		if (!userId) return res.status(500).json({ status: 500 });

		await knex("collection")
			.where({ user_id: userId })
			.then(function (rows) {
				return res.status(200).json({ status: 200, data: rows });
			});
	} else {
		return res.status(500).json({ status: 500 });
	}
}
