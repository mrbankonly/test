const { initOption, validateField, convertMongoUUIDToObjectId } = require("./utils")

class Query {
	constructor(_model) {
		this.model = _model
		this.lookupList = []
		this.pipeline = []

		this.option = {
			lookup: { from: null, field: null, refField: null, as: null, many: false, skipNullRecord: true }
		}
	}
	aggregate(search) {
		const func = new AggregateOption()
		return func
	}
}

class AggregateOption extends Query {
	lookup({ from, field, refField, as, many = false, skipNullRecord = true }) {
		let option = { from, field, refField, as, many, skipNullRecord }
		option = initOption(option, this.option.lookup)

		// Validate field
		validateField('LOOKUP')(option.from, option.field, option.refField, option.as, option.many, option.skipNullRecord)

		this.pipeline.push({
			$lookup: { from: option.from, localField: option.field, foreignField: option.refField, as: option.as },
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

	exec() {
		console.log(this.pipeline)
	}
}

module.exports = Query