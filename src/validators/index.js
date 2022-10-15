class Validator {
	errors = {}
	resultBody = {}
	resultQuery = {}
	resultHeaders = {}
	constructor(param1, params2) {
		const req = param1
		this.mongoose = params2
		this._body = req.body
		this._query = req.query
		this.headers = req.headers
	}
	body(field, message) {
		this.errors[field] = 0
		const next = new ValidateRule(field, message, this._body[field], this)
		return next
	}
	query(field, message) {
		this.errors[field] = 0
		const next = new ValidateRule(field, message, this._body[field], this)
		return next
	}
	header(field, message) {
		this.errors[field] = 0
		const next = new ValidateRule(field, message, this._body[field], this)
		return next
	}
	validate(option = {
		restrictKey: false,
		allowNull: false,
		useError: false
	}) {
		console.log(this.errors)
	}
}

class ValidateRule extends Validator {
	constructor(field, message, value, parent) {
		super({
			body: parent._body,
			query: parent._query,
			headers: parent.headers
		}, parent.mongoose)
		this.field = field
		this.message = message
		this.value = value
		this.parent = parent
	}
	required() {
		const next = new ValidateChain(this.field, this.message, this._body[this.field], true, this.parent)
		return next
	}
	optional(allowNull = false) {
		const next = new ValidateChain(this.field, this.message, this._body[this.field], false, this.parent, allowNull)
		return next
	}
}

class ValidateChain extends Validator {
	constructor(field, message, value, required, parent, allowNull) {
		super({
			body: parent._body,
			query: parent._query,
			headers: parent.headers
		}, parent.mongoose)
		this.field = field
		this.message = message
		this.value = value
		this.parent = parent
		this.mongoose = parent.mongoose
		this.required = required
		this.allowNull = allowNull
	}
	_performValidate(typeName) {
		if (typeof this.value !== typeName) {
			this.parent.errors[this.field + "_type"] = 1
			return false
		}
		if (this.required && this._isEmpty()) this.parent.errors[this.field] = 1
		if (!this.allowNull && this._isEmpty()) this.parent.errors[this.field] = 1
		return true
	}
	_performNoTypeValidate() {
		if (this.required && this._isEmpty()) this.parent.errors[this.field] = 1
		if (!this.allowNull && this._isEmpty()) this.parent.errors[this.field] = 1
		return true
	}
	_isEmpty() {
		return this.value === "" || this.value === null || this.value === undefined
	}
	_isPassed() {
		if (!this.required && !this.allowNull && this._isEmpty()) {
			return false
		}
		return this.required && this._isEmpty()
	}
	string() {
		if (this._isPassed()) return this
		this._performValidate("string")
		return this
	}
	isIP() {
		if (this._isPassed()) return this
		if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(this.value)) return true
		this.parent.errors[this.field] = 1
		return this
	}
	number(option = { min: 0, max: 0 }) {
		if (this._isPassed() && !(option.min || option.max)) return this
		this._performValidate("number")

		if (option.min && this.value < option.min) this.parent.errors[this.field + "_min"] = 1
		if (option.max && this.value > option.max) this.parent.errors[this.field + "_max"] = 1

		return this
	}

	isInt(option = { min: 0, max: 0 }) {
		if (this._isPassed() && !(option.min || option.max)) return this
		this._performNoTypeValidate()

		if (!Number.isInteger(this.value)) this.parent.errors[this.field] = 1

		if (option.min && this.value < option.min) this.parent.errors[this.field + "_min"] = 1
		if (option.max && this.value > option.max) this.parent.errors[this.field + "_max"] = 1

		return this
	}
	email() {
		if (this._isPassed()) return this
		this._performValidate("string")
		if (!this.value.match(/[a-z].com|[a-z].info|[a-z].org/g)) {
			this.parent.errors[this.field] = 1
		}
		if (!this.value.match(/[a-z]@/g)) {
			this.parent.errors[this.field] = 1
		}
		return this
	}
	enum(...value) {
		if (this._isPassed()) return this
		this._performValidate("string")
		if (!value.includes(this.value)) this.parent.errors[this.field] = 1
		return this
	}
}

module.exports = Validator