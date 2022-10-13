const { initOption, validateField, convertMongoUUIDToObjectId } = require("./utils")

class Query {
	constructor(_model) {
		this.model = _model
		this.lookupList = []
		this.pipeline = []

		this.option = {
			lookup: { from: null, field: null, foreignField: null, as: null, many: false, skipNullRecord: true }
		}
	}
	aggregate(search) {
		const func = new AggregateOption()
		return func
	}
}

class AggregateOption extends Query {
	lookup({ from, localField, foreignField, as, many = false, skipNullRecord = true }) {
		let option = { from, localField, foreignField, as, many, skipNullRecord }
		option = initOption(option, this.option.lookup)

		// Validate field
		validateField('LOOKUP')(option.from, option.localField, option.foreignField, option.as, option.many, option.skipNullRecord)

		this.pipeline.push({
			$lookup: {
				from: from,
				let: { fromId: "$" + localField },
				pipeline: [
					{ $match: { $expr: { $eq: ["$" + foreignField, "$$fromId"] } }, },
					{ $project: { _id: 1, username: 1 } }
				],
				as: as
			}
		})

		if (!option.many) {
			this.pipeline.push({
				$unwind: { path: "$" + as, preserveNullAndEmptyArrays: option.skipNullRecord },
			})
		}
		return this
	}
	match(condition) {
		convertMongoUUIDToObjectId(condition)
		this.pipeline.push({ $match: condition })
		return this
	}

	custom(pipeline) {
		this.pipeline.push(pipeline)
		return this
	}

	exec() {
		console.log(this.pipeline)
	}
}

module.exports = Query