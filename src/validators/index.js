const { chainString, chainIP, chainNumber, chainInt, chainEmail, chainEnums, chainBool, chainObjectId, chainUuid, _performArrayValidate, chainArray, chainObject, chainDate, chainFile, chainCustom, chainMongoose, LOGIC_TYPE } = require("./chain")
const { getFieldFormObject } = require("./utils")

class Validator {
	errors = {}
	context = []
	resultBody = {}
	resultQuery = {}
	resultHeaders = {}
	validKeys = {}
	constructor(param1, params2, self) {
		const req = param1
		this.req = param1
		this.mongoose = params2
		this._body = req.body
		this._query = req.query
		this.headers = req.headers
		this.convertedBody = req.items
		this.self = self || this
		this.objectCount = 0

		if (req.items) {
			this.self.convertedBody = req.items
		}
	}

	body(field, message, required) {
		message = message || "Validate error on " + field
		if (field === "*") {
			const newBody = { "*": this._body }
			this._body = newBody
		}
		const { value, isArrayField } = getFieldFormObject(this._body, this)
		this.convertedBody = value
		field = isArrayField ? isArrayField : field
		this.validKeys[field] = value[field]
		const next = new ValidateRule(field, message, value[field], this, required)
		return next
	}
	query(field, message, required) {
		this.validKeys[field] = value[field]
		message = message || "Validate error on " + field
		const next = new ValidateRule(field, message, this._body[field], this, required)
		return next
	}
	header(field, message, required) {
		this.validKeys[field] = value[field]
		message = message || "Validate error on " + field
		const next = new ValidateRule(field, message, this._body[field], this, required)
		return next
	}

	async validate(options = {
		restrictKey: true,
		allowNull: false,
		useError: false,
		storeContext: null
	}) {

		if (options.storeContext) {
			this.req.context = {}
		}

		// Mongo perform
		for (let i = 0; i < this.context.length; i++) {
			const { key, value, as, option, message, logicType, model, operator } = this.context[i]
			const result = await this.mongoose.model("user").findOne({ [`${key}`]: value })

			if (
				(logicType === LOGIC_TYPE.MUST_EXIST && result) ||
				(logicType === LOGIC_TYPE.FIND && result) ||
				(logicType === LOGIC_TYPE.MUST_NOT_EXIST && !result)
			) {
				if (options.storeContext) {
					if (this.req.context[`_${as}`]) {
						if (Array.isArray(this.req.context[`_${as}`])) {
							this.req.context[`_${as}`].push(result)
						} else {
							this.req.context[`_${as}`] = [this.req.context[`_${as}`], result]
						}
					} else {
						this.req.context[`_${as}`] = result
					}
				}
				continue
			}

			if (options.useError) {
				throw new Error(`400::MongoValidator: No record of ${key}.${value}`)
			}

			this.errors["mongoose_validate_" + key] = message
		}

		let messages = []

		const errorKeys = Object.keys(this.errors)
		for (let i = 0; i < errorKeys.length; i++) {
			const errorKey = errorKeys[i];

			if (options.useError) {
				throw new Error(`400::${this.errors[errorKey]}`)
			}
			messages.push({
				from: errorKey,
				detail: this.errors[errorKey]
			})
		}

		if (options.restrictKey) {
			const bodyKey = Object.keys(this._body);
			const isValidRequest = bodyKey.every((key) => {
				const find = Object.keys(this.validKeys).includes(key)
				return find
			}
			);
			if (!isValidRequest) throw new Error(`400::bad_request`)
		}

		const next = new ValidateResult(messages)
		return next
	}
}

class ValidateResult {
	constructor(messages) {
		this.messages = messages
	}
	isEmpty() {
		if (this.messages.length < 1) return true
		return false
	}
	errors() {
		return this.messages
	}
	throwError(fullError = false) {
		if (this.isEmpty()) return
		let message = `400::Validator: ${this.messages[0].from} ${this.messages[0].detail}`
		if (!fullError) message = `400::${this.messages[0].detail}`
		throw new Error(message)
	}
}

class ValidateRule extends Validator {
	constructor(field, message, value, parent, required, parentField) {
		super({
			body: parent._body,
			query: parent._query,
			headers: parent.headers,
			items: parent.convertedBody,
		}, parent.mongoose, parent)

		this.field = field
		this.message = message
		this.value = value
		this.parent = parent
		this.parentField = parentField
	}
	required() {
		const next = new ValidateChain(this.field, this.message, this.value, true, this.parent, false, this.parentField)
		return next
	}
	optional(allowNull = false) {
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
			items: parent.convertedBody,
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
	string() {
		const isRunned = _performArrayValidate(this, () => chainString(this))
		if (isRunned) return this
		chainString(this)
		return this
	}
	IP() {
		const isRunned = _performArrayValidate(this, () => chainIP(this))
		if (isRunned) return this
		chainIP(this)
		return this
	}
	number(option = { min: 0, max: 0 }) {
		const isRunned = _performArrayValidate(this, () => chainNumber(option, this))
		if (isRunned) return this
		chainNumber(option, this)
		return this
	}
	date() {
		const isRunned = _performArrayValidate(this, () => chainDate(this))
		if (isRunned) return this
		chainDate(this)
		return this
	}
	file() {
		const isRunned = _performArrayValidate(this, () => chainFile(this))
		if (isRunned) return this
		chainFile(this)
		return this
	}

	int(option = { min: 0, max: 0 }) {
		const isRunned = _performArrayValidate(this, () => chainInt(option, this))
		if (isRunned) return this
		chainInt(option, this)
		return this
	}
	email() {
		const isRunned = _performArrayValidate(this, () => chainEmail(this))
		if (isRunned) return this
		chainEmail(this)
		return this
	}
	enum(...value) {
		const isRunned = _performArrayValidate(this, () => chainEnums(this, value))
		if (isRunned) return this
		chainEnums(this, value)
		return this
	}
	bool() {
		const isRunned = _performArrayValidate(this, () => chainBool(this))
		if (isRunned) return this
		chainBool(this)
		return this
	}
	objectId() {
		const isRunned = _performArrayValidate(this, () => chainObjectId(this))
		if (isRunned) return this
		chainObjectId(this)
		return this
	}
	uuid(version) {
		const isRunned = _performArrayValidate(this, () => chainUuid(version, this))
		if (isRunned) return this
		chainUuid(version, this)
		return this
	}
	array(option = { minLength: null, maxLength: null }) {
		chainArray(option, this)
	}
	object(allowEmptyObject = false) {
		const isRunned = _performArrayValidate(this, () => chainObject(allowEmptyObject, this))
		if (isRunned) return this
		chainObject(allowEmptyObject, this)
	}
	mustExistIn(modelName, option = { key: null, skipKey: null, as: null, message: null, operator: "$eq" }) {

		const isRunned = _performArrayValidate(this, () => chainMongoose(modelName, option, this, LOGIC_TYPE.MUST_EXIST))
		if (isRunned) return
		chainMongoose(modelName, option, this, LOGIC_TYPE.MUST_EXIST)
	}
	mustNotExistIn(modelName, option = { key: null, skipKey: null, as: null, message: null, operator: "$eq" }) {
		const isRunned = chainMongoose(this, () => chainMongoose(modelName, option, this, LOGIC_TYPE.MUST_NOT_EXIST))
		if (isRunned) return
		chainMongoose(modelName, option, this, LOGIC_TYPE.MUST_NOT_EXIST)
	}
	onModel(modelName, option = { key: null, skipKey: null, as: null, message: null, operator: "$eq" }) {
		const isRunned = _performArrayValidate(this, () => chainMongoose(modelName, option, this, LOGIC_TYPE.FIND))
		if (isRunned) return
		chainMongoose(modelName, option, this, LOGIC_TYPE.FIND)
	}
	custom(callback) {
		const isRunned = _performArrayValidate(this, () => chainCustom(callback, this))
		if (isRunned) return
		chainCustom(callback, this)
	}
}


module.exports = Validator