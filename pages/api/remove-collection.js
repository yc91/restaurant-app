import { knex } from "../../lib/db";

export default async function handler(req, res) {
	if (req.method === "POST") {
		const collectionId = req.body.collection;
		const userId = req.body.user;

		if (!userId && !restaurantId)
			return res.status(500).json({ status: 500 });

		await knex("collection")
			.where({ id: collectionId, user_id: userId })
			.del()
			.then(function () {
				return res.status(200).json({ status: 200 });
			});
	} else {
		return res.status(500).json({ status: 500 });
	}
}
