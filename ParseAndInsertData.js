const fs = require("fs");
const mysql = require("mysql");
const fastcsv = require("fast-csv");
const moment = require("moment");

const dayRangeRegex = /([a-zA-Z]{3,5}(\s?-\s?)[a-zA-Z]{3,5})/g;
const timeRangeRegex = /([0-9])?([0-9])?(:)?([0-9][0-9])?\s*([AaPp][Mm])/g;
const firstSingularDayRegex = /^(\s?)[a-zA-Z]{3,5}(?!\s?-\s?)/g;
const secondarySingularDayRegex = /([,][\s][a-zA-Z]{3,5}(?!\s?-\s?))/g;
const removeWhiteSpaceRegex = /\s+/g;
const removeWhiteSpaceAndCommaRegex = /[,\s]/g;

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	insecureAuth: true,
});

//populate day table
insertDays();

let csvData = [];
let stream = fs.createReadStream("hours.csv");
let csvStream = fastcsv
	.parse()
	.on("data", function (data) {
		csvData.push(data);
	})
	.on("end", function () {
		//remove header
		csvData.shift();
		//fill restaurant table
		let query = "INSERT INTO restaurant (name, description) VALUES ?";
		connection.query(query, [csvData], async (error, response) => {
			if (error) console.log(error);
			for (let i = 0; i < csvData.length; i++) {
				//parse resturant operating hour and fill data
				await parseData(csvData[i]);
			}
			process.exit();
		});
	});

function parseData(data) {
	return new Promise(async (resolve, reject) => {
		let name = data[0];
		let operating = data[1];

		try {
			let restaurant = await getRestaurant(data[0]);
			let days = await getDays();

			//array for conversion of days into id
			//e.g daysArr[Mon] = 1;
			let daysArr = [];
			for (let x = 0; x < days.length; x++) {
				daysArr[days[x].day] = days[x].id;
			}
			//Convert operating hour to array
			//e.g Mon 5:15 pm - 7:30 pm / Tues 3:30 pm - 8:30 pm => [Mon 5:15 pm - 7:30 pm, Tues 3:30 pm - 8:30 pm]
			let operatingHour = operating.split("/");

			for (let i = 0; i < operatingHour.length; i++) {
				//run through different parsing format
				parseFirstDay(operatingHour[i], daysArr, restaurant[0]);
				parseSecondaryDay(operatingHour[i], daysArr, restaurant[0]);
				parseDayRange(operatingHour[i], daysArr, restaurant[0]);
				resolve("done");
			}
		} catch (e) {
			console.log(e);
		}
	});
}

//get obj from restaurant table based on name
function getRestaurant(name) {
	return new Promise((resolve, reject) => {
		let query = "SELECT * FROM restaurant WHERE name = ?";
		connection.query(query, [name], (error, response) => {
			if (error) reject(error);
			resolve(response);
		});
	});
}

//get all obj from day table in DB
function getDays() {
	return new Promise((resolve, reject) => {
		let query = "SELECT * FROM day";
		connection.query(query, (error, response) => {
			if (error) reject(error);
			resolve(response);
		});
	});
}

//get day range and start/end time from a string
//e.g Mon - Tues 4:45 pm - 8 pm
function parseDayRange(operatingHour, daysArr, restaurant) {
	//Regex matching
	let dayRange = operatingHour.match(dayRangeRegex);
	let timeRange = operatingHour.match(timeRangeRegex);

	if (dayRange && timeRange && timeRange.length == 2) {
		for (let j = 0; j < dayRange.length; j++) {
			//remove whitespace
			let range = dayRange[j].replace(removeWhiteSpaceRegex, "");
			let rangeArr = range.split("-");
			if (rangeArr.length < 2) {
				//trigger if incorrect format
				break;
			}

			for (let n = 0; n < rangeArr.length; n++) {
				//standardised day
				rangeArr[n] = standardisedDay(rangeArr[n]);
			}

			let firstDay = daysArr[rangeArr[0]];
			let lastDay = daysArr[rangeArr[1]];
			//if no matching day
			if (!firstDay && !lastDay) break;
			//get duration of open -> close
			let startTime = moment(timeRange[0], ["h:mm a"]);
			let endTime = moment(timeRange[1], ["h:mm a"]);
			if (endTime.isBefore(startTime)) {
				endTime.add(1, "d");
			}
			let duration = parseInt(
				moment.duration(endTime.diff(startTime)).asHours()
			);
			//convert time to mysql time format
			for (let m = 0; m < timeRange.length; m++) {
				timeRange[m] = moment(timeRange[m], ["h:mm a"]).format(
					"HH:mm:ss"
				);
			}

			for (let y = firstDay; y <= lastDay; y++) {
				//Obj to insert into DB
				let insertObj = [
					[y, restaurant.id, timeRange[0], timeRange[1], duration],
				];
				//Insertion
				let query =
					"INSERT INTO opening (day_id, restaurant_id, start_time, end_time, duration) VALUES ?";
				connection.query(query, [insertObj], (error, response) => {
					if (error) console.log(error);
				});
			}
		}
	}
}

//get first day from a string
//e.g Mon 4:45 pm - 8 pm
function parseFirstDay(operatingHour, daysArr, restaurant) {
	//Regex matching
	let firstDay = operatingHour.match(firstSingularDayRegex);
	let timeRange = operatingHour.match(timeRangeRegex);

	if (firstDay && timeRange && timeRange.length == 2) {
		//remove whitespace
		let dayStr = firstDay[0].replace(removeWhiteSpaceRegex, "");
		//standardised day
		dayStr = standardisedDay(dayStr);

		let day = daysArr[dayStr];
		//if no matching day
		if (!day) return;

		//get duration of open -> close
		let startTime = moment(timeRange[0], ["h:mm a"]);
		let endTime = moment(timeRange[1], ["h:mm a"]);
		if (endTime.isBefore(startTime)) {
			endTime.add(1, "d");
		}
		let duration = parseInt(
			moment.duration(endTime.diff(startTime)).asHours()
		);
		//convert time to mysql time format
		for (let m = 0; m < timeRange.length; m++) {
			timeRange[m] = moment(timeRange[m], ["h:mm a"]).format("HH:mm:ss");
		}

		//Obj to insert into DB
		let insertObj = [
			[day, restaurant.id, timeRange[0], timeRange[1], duration],
		];
		//Insertion
		let query =
			"INSERT INTO opening (day_id, restaurant_id, start_time, end_time, duration) VALUES ?";
		connection.query(query, [insertObj], (error, response) => {
			if (error) console.log(error);
		});
	}
}

//get non-first and non range day from a string (any days with a comma behind)
//e.g , Mon
function parseSecondaryDay(operatingHour, daysArr, restaurant) {
	//Regex matching
	let secondaryDay = operatingHour.match(secondarySingularDayRegex);
	let timeRange = operatingHour.match(timeRangeRegex);

	if (secondaryDay && timeRange && timeRange.length == 2) {
		for (let j = 0; j < secondaryDay.length; j++) {
			//remove whitespace
			let dayStr = secondaryDay[0].replace(
				removeWhiteSpaceAndCommaRegex,
				""
			);
			//standardised day
			dayStr = standardisedDay(dayStr);

			let day = daysArr[dayStr];
			//if no matching day
			if (!day) break;
			//get duration of open -> close
			let startTime = moment(timeRange[0], ["h:mm a"]);
			let endTime = moment(timeRange[1], ["h:mm a"]);
			if (endTime.isBefore(startTime)) {
				endTime.add(1, "d");
			}
			let duration = parseInt(
				moment.duration(endTime.diff(startTime)).asHours()
			);
			//convert time to mysql time format
			for (let m = 0; m < timeRange.length; m++) {
				timeRange[m] = moment(timeRange[m], ["h:mm a"]).format(
					"HH:mm:ss"
				);
			}
			//Obj to insert into DB
			let insertObj = [
				[day, restaurant.id, timeRange[0], timeRange[1], duration],
			];
			//Insertion
			let query =
				"INSERT INTO opening (day_id, restaurant_id, start_time, end_time, duration) VALUES ?";
			connection.query(query, [insertObj], (error, response) => {
				if (error) console.log(error);
			});
		}
	}
}

function standardisedDay(day) {
	//Standardised day text format
	if (day == "Tues") day = "Tue";
	else if (day == "Weds") day = "Wed";
	else if (day == "Thur") day = "Thu";
	else if (day == "Thurs") day = "Thu";
	return day;
}

function insertDays() {
	let query = [
		"INSERT INTO day (id, day) VALUES ('1', 'Mon')",
		"INSERT INTO day (id, day) VALUES ('2', 'Tue')",
		"INSERT INTO day (id, day) VALUES ('3', 'Wed')",
		"INSERT INTO day (id, day) VALUES ('4', 'Thu')",
		"INSERT INTO day (id, day) VALUES ('5', 'Fri')",
		"INSERT INTO day (id, day) VALUES ('6', 'Sat')",
		"INSERT INTO day (id, day) VALUES ('7', 'Sun')",
	];
	for (let i = 0; i < query.length; i++) {
		connection.query(query[i], (error, response) => {
			if (error) console.log(error);
		});
	}
}

stream.pipe(csvStream);
