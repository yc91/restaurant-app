import { knex } from "../../lib/db";

export default async function handler(req, res) {
	if (req.method === "POST") {
		const name = req.body.name;
		const userId = req.body.user;

		if (!name && !userId) return res.status(500).json({ status: 500 });

		await knex("collection")
			.insert({ name: name, user_id: userId })
			.then(function (row) {
				return res.status(200).json({ status: 200, data: row });
			});
	} else {
		return res.status(500).json({ status: 500 });
	}
}
