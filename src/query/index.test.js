
const Query = require(".")
const mongoose = require("mongoose")

function connectDatabase() {
	const url = "mongodb+srv://bank:Bank211998Tsc_@cluster0.ih5kz.mongodb.net/test-orm?retryWrites=true&w=majority"
	return mongoose.connect(url)
}

// connectDatabase().then(() => {
const instance = new Query()
instance.aggregate()
	.lookup({ from: "model", field: "field", refField: "refField", as: "as" })
	.match({
		_id: "507f191e810c19729de860ea",
		object: { _id: "507f191e810c19729de860ea" },
		arrayObject: [{ _id: "507f191e810c19729de860ea" }]
	})
	.exec()

process.exit(1)
// })



