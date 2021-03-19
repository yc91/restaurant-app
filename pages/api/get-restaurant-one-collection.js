import { knex } from "../../lib/db";

export default async function handler(req, res) {
	if (req.method === "POST") {
		const userId = req.body.user;
		const collectionId = req.body.collection;

		if (!userId && !collectionId)
			return res.status(500).json({ status: 500 });

		await knex("collection_restaurant")
			.innerJoin(
				"collection",
				"collection_restaurant.collection_id",
				"=",
				"collection.id"
			)
			.innerJoin(
				"restaurant",
				"restaurant.id",
				"=",
				"collection_restaurant.restaurant_id"
			)
			.where({
				"collection.user_id": userId,
				"collection.id": collectionId,
			})
			.then(function (rows) {
				return res.status(200).json({ status: 200, data: rows });
			});
	} else {
		return res.status(500).json({ status: 500 });
	}
}
