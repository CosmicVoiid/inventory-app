#! /usr/bin/env node

console.log(
	"This script populates some test items and categorys to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Item = require("./models/item");
var Category = require("./models/category");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var items = [];
var categorys = [];

function itemCreate(name, description, category, price, in_stock, cb) {
	itemdetail = {
		name: name,
		description: description,
		category: category,
		price: price,
		in_stock: in_stock,
	};

	var item = new Item(itemdetail);

	item.save(function (err) {
		if (err) {
			cb(err, null);
			return;
		}
		console.log("New item: " + item);
		items.push(item);
		cb(null, item);
	});
}

function categoryCreate(name, description, cb) {
	var category = new Category({ name: name, description: description });

	category.save(function (err) {
		if (err) {
			cb(err, null);
			return;
		}
		console.log("New Category: " + category);
		categorys.push(category);
		cb(null, category);
	});
}

// function bookCreate(title, summary, isbn, author, genre, cb) {
// 	bookdetail = {
// 		title: title,
// 		summary: summary,
// 		author: author,
// 		isbn: isbn,
// 	};
// 	if (genre != false) bookdetail.genre = genre;

// 	var book = new Book(bookdetail);
// 	book.save(function (err) {
// 		if (err) {
// 			cb(err, null);
// 			return;
// 		}
// 		console.log("New Book: " + book);
// 		books.push(book);
// 		cb(null, book);
// 	});
// }

function createCategorys(cb) {
	async.series(
		[
			function (callback) {
				categoryCreate(
					"Gloves",
					"Padded combat gloves for practice and competition",
					callback
				);
			},
			function (callback) {
				categoryCreate(
					"Heavy Bags",
					"Punching/Kicking heavy bags for practicing technique and power",
					callback
				);
			},
			function (callback) {
				categoryCreate(
					"Handwraps",
					"Handwraps from wrist and knuckle protection",
					callback
				);
			},
			function (callback) {
				categoryCreate("Pads", "Pads for coaching", callback);
			},
			function (callback) {
				categoryCreate("Sparring gear", "Sparring protection gear", callback);
			},
			function (callback) {
				categoryCreate(
					"Strength and Conditioning",
					"General strength and conditioning equipment",
					callback
				);
			},
		],
		// optional callback
		cb
	);
}

function createItems(cb) {
	async.parallel(
		[
			function (callback) {
				itemCreate(
					"Fairtex Gloves",
					"Original Fairtex gloves made in Thailand",
					categorys[0],
					80,
					5,
					callback
				);
			},
			function (callback) {
				itemCreate(
					"Fairtex Banana Bag",
					"Original Fairtex bannana bag",
					categorys[1],
					100,
					3,
					callback
				);
			},
			function (callback) {
				itemCreate(
					"Fairtex Standard Heavy Bag",
					"Original Fairtex Heavy Bag",
					categorys[1],
					100,
					2,
					callback
				);
			},
		],
		// optional callback
		cb
	);
}

async.series(
	[createCategorys, createItems],
	// Optional callback
	function (err, results) {
		if (err) {
			console.log("FINAL ERR: " + err);
		} else {
			console.log("All Items: " + items);
		}
		// All done, disconnect from database
		mongoose.connection.close();
	}
);
