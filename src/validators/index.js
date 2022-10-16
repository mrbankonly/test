const { getFieldFormObject } = require("./utils")

class Validator {
	errors = {}
	resultBody = {}
	resultQuery = {}
	resultHeaders = {}
	constructor(param1, params2, self, parentField) {
		const req = param1
		this.mongoose = params2
		this._body = req.body
		this._query = req.query
		this.headers = req.headers
		this.arrayItems = req.items
		this.self = self
		this.parentField = parentField
	}
	body(field, message, required) {
		this.errors[field] = 0
		const next = new ValidateRule(field, message, this._body[field], this, required)
		return next
	}
	query(field, message, required) {
		this.errors[field] = 0
		const next = new ValidateRule(field, message, this._body[field], this, required)
		return next
	}
	header(field, message, required) {
		this.errors[field] = 0
		const next = new ValidateRule(field, message, this._body[field], this, required)
		return next
	}

	item(field, message, required) {

		console.log(this.arrayItems)
		if (Array.isArray(this.arrayItems)) this.arrayItems = {}
		if (typeof this.arrayItems !== "object") this.arrayItems = {}
		const next = new ValidateRule(field, message, this.arrayItems[field], this.self, required, this.parentField)
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
	constructor(field, message, value, parent, required, parentField) {
		super({
			body: parent._body,
			query: parent._query,
			headers: parent.headers,
			items: parent.arrayItems,
		}, parent.mongoose, parent, parentField)
		this.field = field
		this.message = message
		this.value = value
		this.parent = parent
		this.parentField = parentField
		console.log(parent)
	}
	required() {
		if (this.arrayItems) {
			this.value = this.arrayItems[this.field]
		}
		const next = new ValidateChain(this.field, this.message, this.value, true, this.parent, null, this.parentField)
		return next
	}
	optional(allowNull = false) {
		if (this.arrayItems) {
			this.value = this.arrayItems[this.field]
		}
		const next = new ValidateChain(this.field, this.message, this.value, false, this.parent, allowNull, this.parentField)
		return next
	}
}

class ValidateChain extends Validator {
	regexUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
	regexUUIDV1 = /^[0-9A-F]{8}-[0-9A-F]{4}-[1][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
	regexUUIDV2 = /^[0-9A-F]{8}-[0-9A-F]{4}-[2][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
	regexUUIDV3 = /^[0-9A-F]{8}-[0-9A-F]{4}-[3][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
	regexUUIDV4 = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
	regexUUIDV5 = /^[0-9A-F]{8}-[0-9A-F]{4}-[5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
	constructor(field, message, value, required, parent, allowNull, parentField) {
		super({
			body: parent._body,
			query: parent._query,
			headers: parent.headers,
			items: parent.arrayItems,
		}, parent.mongoose, parent, parentField)
		this.field = field
		this.message = message
		this.value = value === null || value === undefined ? "" : value
		this.parent = parent
		this.mongoose = parent.mongoose
		this.required = required
		this.allowNull = allowNull
		this.originField = this.field
		if (parentField) {
			this.originField = parentField + "." + this.field
		}
	}
	_performValidate(typeName) {
		if (typeof this.value !== typeName) {
			this.parent.errors[this.originField + ".type"] = 1
			return false
		}
		if (this.required && this._isEmpty()) this.parent.errors[this.originField] = 1
		if (!this.allowNull && this._isEmpty()) this.parent.errors[this.originField] = 1
		return true
	}
	_performNoTypeValidate() {
		if (this.required && this._isEmpty()) this.parent.errors[this.originField] = 1
		if (!this.allowNull && this._isEmpty()) this.parent.errors[this.originField] = 1
		return true
	}
	_isEmpty(value) {
		return this.value === "" || this.value === null || this.value === undefined || this.value === {}
	}
	_isPassed() {
		if (!this.required && this.allowNull && this._isEmpty()) {
			return true
		}
		return false
	}
	string() {
		if (this._isPassed()) return this
		this._performValidate("string")
		return this
	}
	IP() {
		if (this._isPassed()) return this
		if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(this.value)) return true
		this.parent.errors[this.originField] = 1
		return this
	}
	number(option = { min: 0, max: 0 }) {
		if (this._isPassed() && !(option.min || option.max)) return this
		this._performValidate("number")

		if (option.min && this.value < option.min) this.parent.errors[this.originField + ".min"] = 1
		if (option.max && this.value > option.max) this.parent.errors[this.originField + ".max"] = 1

		return this
	}

	int(option = { min: 0, max: 0 }) {
		if (this._isPassed() && !(option.min || option.max)) return this
		this._performNoTypeValidate()

		if (!Number.isInteger(this.value)) this.parent.errors[this.originField] = 1

		if (option.min && this.value < option.min) this.parent.errors[this.originField + ".min"] = 1
		if (option.max && this.value > option.max) this.parent.errors[this.originField + ".max"] = 1

		return this
	}
	email() {
		if (this._isPassed()) return this
		this._performValidate("string")
		if (!this.value.match(/[a-z].com|[a-z].info|[a-z].org/g)) {
			this.parent.errors[this.originField] = 1
		}
		if (!this.value.match(/[a-z]@/g)) {
			this.parent.errors[this.originField] = 1
		}
		return this
	}
	enum(...value) {
		if (this._isPassed()) return this
		if (!value.includes(this.value)) this.parent.errors[this.originField] = 1
		return this
	}
	bool() {
		if (this._isPassed()) return this
		this._performValidate("boolean")
		return this
	}
	objectId() {
		if (this._isPassed()) return this
		if (!this.value.toString().match(/^[0-9a-fA-F]{24}$/)) {
			this.parent.errors[this.originField] = 1
		}
		return this
	}
	uuid(version) {
		if (!Number.isInteger(version)) throw new Error("Invalid version given type must be integer")

		if (this._isPassed()) return this

		let regex = this.regexUUID // default

		if (version === 1) regex = this.regexUUIDV1
		if (version === 2) regex = this.regexUUIDV2
		if (version === 3) regex = this.regexUUIDV3
		if (version === 4) regex = this.regexUUIDV4
		if (version === 5) regex = this.regexUUIDV5

		if (!this.value.toString().match(regex)) {
			this.parent.errors[this.originField] = 1
		}
		return this
	}
	array(option = { minLength: null, maxLength: null }) {
		if (this._isPassed() && !(option.maxLength || option.minLength)) return this
		this._performValidate("object")
		if (!Array.isArray(this.value)) {
			this.parent.errors[this.originField + ".type"] = 1
		}

		if (option.minLength && this.value.length < option.minLength) {
			this.parent.errors[this.originField] = 1
		}

		if (option.maxLength && this.value.length > option.maxLength) {
			this.parent.errors[this.originField] = 1
		}

		const validator = new Validator({ item: this.value })
		return validator
	}
	object(allowEmptyObject = false) {
		if (!this._isPassed()) {
			this._performValidate("object")
		}

		if (Array.isArray(this.value)) {
			this.parent.errors[this.originField] = 1
		}

		if (!allowEmptyObject && Object.keys(this.value).length < 1) {
			this.parent.errors[this.originField] = 1
		}

		const validator = new Validator({ items: this.value }, this.mongoose, this.parent, this.field)
		return validator
	}
}


module.exports = Validator