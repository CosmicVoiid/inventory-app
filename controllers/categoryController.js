const Category = require("../models/category");
const Item = require("../models/item");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.index = (req, res) => {
	Category.find()
		.sort({ name: 1 })
		.then((results) => {
			res.render("index", {
				categories: results,
				title: "Inventory",
			});
		})
		.catch((err) => {
			res.send(err);
		});
};

exports.category_list = (req, res) => {
	res.send("NOT IMPLEMENTED: Category list");
};

exports.category_detail = (req, res, next) => {
	async.parallel(
		{
			category: (callback) => {
				Category.findById(req.params.id).exec(callback);
			},
			category_items: (callback) => {
				Item.find({ category: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) return next(err);
			if (results.category == null) {
				let err = new Error("Category not found");
				err.status(404);
				return next(err);
			}
			res.render("category-detail", {
				title: results.category.name,
				category: results.category,
				items: results.category_items,
			});
		}
	);
};

exports.category_create_get = (req, res, next) => {
	res.render("category-form", {
		title: "Create Category",
		category: undefined,
		description: undefined,
		errors: false,
	});
};

exports.category_create_post = [
	body("name", "Category name required").trim().isLength({ min: 1 }).escape(),

	(req, res, next) => {
		const errors = validationResult(req);
		console.log(req.body);
		let category = new Category({
			name: req.body.name,
			description: req.body.description,
		});

		if (!errors.isEmpty()) {
			res.render("category-form", {
				title: "Create Category",
				category: category,
				errors: errors.array(),
			});
			return;
		} else {
			Category.findOne({ name: req.body.name }).exec(function (
				err,
				found_category
			) {
				if (err) {
					return next(err);
				}

				if (found_category) {
					res.redirect(found_category.url);
				} else {
					category.save(function (err) {
						if (err) {
							return next(err);
						}
						res.redirect(category.url);
					});
				}
			});
		}
	},
];

exports.category_delete_get = (req, res, next) => {
	async.parallel(
		{
			category: (callback) => {
				Category.findById(req.params.id).exec(callback);
			},

			category_items: (callback) => {
				Item.find({ category: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) return next(err);
			if (results.category == null) {
				res.redirect("/inventory");
			}

			res.render("category-delete", {
				title: "Delete Category",
				category: results.category,
				items: results.category_items,
			});
		}
	);
};

exports.category_delete_post = (req, res, next) => {
	async.parallel(
		{
			category: (callback) => {
				Category.findById(req.body.categoryId).exec(callback);
			},

			category_items: (callback) => {
				Item.find({ category: req.body.categoryId }).exec(callback);
			},
		},
		(err, results) => {
			if (err) return next(err);
			if (results.category_items.length > 0) {
				res.render("category-delete", {
					category: results.category,
					items: results.category_items,
				});
				return;
			} else {
				Category.findByIdAndRemove(req.body.categoryId, (err) => {
					if (err) return next(err);
					res.redirect("/inventory");
				});
			}
		}
	);
};

exports.category_update_get = (req, res, next) => {
	Category.findById(req.params.id).exec((err, results) => {
		if (err) return next(err);
		if (results == null) {
			let err = new Error("Item not found");
			err.status = 404;
			return next(err);
		}

		res.render("category-form", {
			title: "Update Category",
			category: results,
			errors: null,
		});
	});
};

exports.category_update_post = [
	body("name", "Name must not be empty").trim().isLength({ min: 1 }).escape(),
	body("description", "Description must not be empty")
		.trim()
		.isLength({ min: 1 })
		.escape(),

	(req, res, next) => {
		const errors = validationResult(req);
		let category = new Category({
			name: req.body.name,
			description: req.body.description,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			Category.findById(req.params.id).exec((err, result) => {
				if (err) return next(err);
				res.render("category-form", {
					title: "Update Category",
					category: result,
					errors: errors.array(),
				});
			});
			return;
		} else {
			Category.findByIdAndUpdate(
				req.params.id,
				category,
				{},
				(err, theCategory) => {
					if (err) return next(err);

					res.redirect(theCategory.url);
				}
			);
		}
	},
];
