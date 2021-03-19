import { knex } from "../../lib/db";

export default async function handler(req, res) {
	if (req.method === "POST") {
		const collectionId = req.body.collection;
		const restaurantId = req.body.restaurant;

		if (!collectionId && !restaurantId)
			return res.status(500).json({ status: 500 });

		await knex("collection_restaurant")
			.where({ collection_id: collectionId, restaurant_id: restaurantId })
			.del()
			.then(function () {
				return res.status(200).json({ status: 200 });
			});
	} else {
		return res.status(500).json({ status: 500 });
	}
}
