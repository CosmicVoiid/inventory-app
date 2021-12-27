const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const async = require("async");
const compression = require("compression");
const helmet = require("helmet");

const indexRouter = require("./routes/index");
const inventoryRouter = require("./routes/inventory");

const app = express();

//assign port number
const port = process.env.PORT || 3000;

//connect to mongodb
const dev_dbURI =
	"mongodb+srv://cosmicvoiid:swapna75710@sandbox.jjgww.mongodb.net/inventory_app?retryWrites=true&w=majority";
const dbURI = process.env.MONGODB_URI || dev_dbURI;

mongoose
	.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then((result) => {
		console.log("Connected to MongoDb");
		app.listen(port);
	})
	.catch((err) => {
		console.log(err);
	});

//view engine
app.set("view engine", "ejs");

//middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use("/", indexRouter);
app.use("/inventory", inventoryRouter);

app.use((req, res) => {
	res.status(404).send({ title: "404 Reg" });
});
