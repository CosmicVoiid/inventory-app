const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
	name: { type: String, required: true },
	description: { type: String, required: true },
	category: { type: Schema.Types.ObjectId, ref: "Category" },
	price: { type: Number, required: true },
	in_stock: { type: Number, required: true },
});

ItemSchema.virtual("url").get(function () {
	return "/inventory/item/" + this._id;
});

const Item = mongoose.model("Item", ItemSchema);

module.exports = Item;
