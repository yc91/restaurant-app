import { knex } from "../../lib/db";
import moment from "moment";

export default async function handler(req, res) {
	let perPage = parseInt(req.query.count) ? parseInt(req.query.count) : 20;
	let currentPage = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
	let name = req.query.name ? req.query.name : null;
	let date =
		req.query.date &&
		moment(req.query.date, "ddd MMM DD YYYY HH:mm:ss").isValid()
			? moment(req.query.date, "ddd MMM DD YYYY HH:mm:ss")
			: null;
	let time =
		req.query.time &&
		moment(req.query.time, "ddd MMM DD YYYY HH:mm:ss").isValid()
			? moment(req.query.time, "ddd MMM DD YYYY HH:mm:ss").format(
					"HH:mm:ss"
			  )
			: null;

	let query = knex("restaurant").select("restaurant.*");

	if (name) query.where("restaurant.name", "like", `%${name}%`);
	if (date || time) {
		query.innerJoin(
			"opening",
			"restaurant.id",
			"=",
			"opening.restaurant_id"
		);

		if (date) {
			let day = date.format("ddd");
			query.innerJoin("day", "day.id", "=", "opening.day_id");
			query.where("day.day", "=", day);
		}

		if (time) {
			query.whereRaw(
				"((CAST(? AS TIME) BETWEEN opening.start_time AND opening.end_time) OR (CAST(? AS TIME) < opening.start_time + INTERVAL opening.duration - 24 HOUR ))",
				[time, time]
			);
		}
	}

	await query
		.groupBy("restaurant.id")
		.paginate({
			perPage: perPage,
			currentPage: currentPage,
			isLengthAware: true,
		})
		.then(function (rows) {
			return res.status(200).json({ status: 200, data: rows });
		});
}
