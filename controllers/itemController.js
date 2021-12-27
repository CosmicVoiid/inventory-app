const Item = require("../models/item");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");
const async = require("async");

exports.item_list = (req, res) => {
	Item.find()
		.then((results) => {
			res.render("item-list", { items: results, title: "Items" });
		})
		.catch((err) => {
			res.send(err);
		});
};

exports.item_detail = (req, res, next) => {
	Item.findById(req.params.id)
		.populate("category")
		.exec((err, results) => {
			if (err) return next(err);
			res.render("item-detail", {
				title: results.name,
				item: results,
				category: results.category.name,
			});
		});
};

exports.item_create_get = (req, res, next) => {
	async.parallel(
		{
			categories: function (callback) {
				Category.find(callback);
			},
		},
		function (err, results) {
			if (err) return next(err);
			res.render("item-form", {
				title: "Create Item",
				item: undefined,
				categories: results.categories,
				errors: null,
				selectedId: null,
			});
		}
	);
};

exports.item_create_post = [
	// (req, res, next) => {
	// 	if (!(req.body.category instanceof Array)) {
	// 		if (typeof req.body.category === "undefined") req.body.category = [];
	// 		else req.body.category = new Arrray(req.body.genre);
	// 	}

	// 	next();
	// },

	body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
	body("description", "Description must not be empty.")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("category", "Category must not be empty.")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("price", "Price must not be empty").trim().isLength({ min: 1 }).escape(),
	body("in_stock", "Stock must not be empty")
		.trim()
		.isLength({ min: 1 })
		.escape(),

	(req, res, next) => {
		const errors = validationResult(req);

		let item = new Item({
			name: req.body.name,
			description: req.body.description,
			category: req.body.category,
			price: req.body.price,
			in_stock: req.body.in_stock,
		});

		if (!errors.isEmpty()) {
			async.parallel(
				{
					categories: function (callback) {
						Category.find(callback);
					},
				},
				function (err, results) {
					if (err) {
						return next(err);
					}

					// for (let i = 0; i < results.categories.length; i++) {
					// 	if (item.category.indexOf(results.categories[i]._id) > -1) {
					// 		results.categories[i].checked = "true";
					// 	}
					// }

					res.render("item-form", {
						title: "Create Item",
						categories: results.categories,
						item: item,
						errors: errors.array(),
						selectedId: null,
					});
				}
			);
			return;
		} else {
			item.save(function (err) {
				if (err) {
					return next(err);
				}
				res.redirect(item.url);
			});
		}
	},
];

exports.item_delete_get = (req, res, next) => {
	Item.findById(req.params.id)
		.populate("category")
		.exec((err, results) => {
			if (err) return next(err);
			if (results == null) {
				res.redirect("/inventory/items");
			}

			res.render("item-delete", {
				title: "Delete Item",
				item: results,
				category: results.category.name,
			});
		});
};

exports.item_delete_post = (req, res, next) => {
	Item.findById(req.body.itemId).exec((err, results) => {
		if (err) return next(err);
		Item.findByIdAndRemove(req.body.itemId, (err) => {
			if (err) return next(err);
			res.redirect("/inventory/items");
		});
	});
};

exports.item_update_get = (req, res, next) => {
	async.parallel(
		{
			item: (callback) => {
				Item.findById(req.params.id).populate("category").exec(callback);
			},
			categories: (callback) => {
				Category.find(callback);
			},
		},
		(err, results) => {
			if (err) return next(err);
			if (results.item == null) {
				let err = new Error("Item not found");
				err.status = 404;
				return next(err);
			}

			res.render("item-form", {
				title: "Update Item",
				item: results.item,
				categories: results.categories,
				selectedId: results.item.category,
				errors: null,
			});
		}
	);
};

exports.item_update_post = [
	body("name", "Name must not be empty").trim().isLength({ min: 1 }).escape(),
	body("description", "Description must not be empty")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("category", "Category must not be empty")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("price", "Description must not be empty")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("in_stock", "Description must not be empty")
		.trim()
		.isLength({ min: 1 })
		.escape(),

	(req, res, next) => {
		const errors = validationResult(req);
		let item = new Item({
			name: req.body.name,
			description: req.body.description,
			category: req.body.category,
			price: req.body.price,
			in_stock: req.body.in_stock,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			async.parallel(
				{
					old_item: (callback) => {
						Item.findById(req.params.id).populate("category").exec(callback);
					},

					categories: (callback) => {
						Category.find().exec(callback);
					},
				},
				(err, results) => {
					if (err) return next(err);

					res.render("item-form", {
						title: "Update Item",
						item: item,
						categories: results.categories,
						errors: errors.array(),
						selectedId: results.item.category,
					});
				}
			);
			return;
		} else {
			Item.findByIdAndUpdate(req.params.id, item, {}, (err, theItem) => {
				if (err) return next(err);

				res.redirect(theItem.url);
			});
		}
	},
];
