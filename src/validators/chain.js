const LOGIC_TYPE = {
    MUST_EXIST: 1,
    MUST_NOT_EXIST: 2,
    FIND: 3,
}

function chainString(_this) {
    if (_isPassed(_this)) return _this

    _performValidate(_this, "string")
}
function chainIP(_this) {
    if (_isPassed(_this)) return _this
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(_this.value)) return true
    _this.parent.errors[_this.originField] = _this.message
}
function chainNumber(option = { min: 0, max: 0 }, _this) {
    if (_isPassed(_this) && !(option.min || option.max)) return _this
    _performValidate(_this, "number")

    if (option.min && _this.value < option.min) _this.parent.errors[_this.originField + ".min"] = _this.message
    if (option.max && _this.value > option.max) _this.parent.errors[_this.originField + ".max"] = _this.message

}

function chainInt(option = { min: 0, max: 0 }, _this) {
    if (_isPassed(_this) && !(option.min || option.max)) return _this
    _performNoTypeValidate(_this)

    if (!Number.isInteger(_this.value)) _this.parent.errors[_this.originField] = _this.message

    if (option.min && _this.value < option.min) _this.parent.errors[_this.originField + ".min"] = _this.message
    if (option.max && _this.value > option.max) _this.parent.errors[_this.originField + ".max"] = _this.message

}
function chainEmail(_this) {
    if (_isPassed(_this)) return _this
    _performValidate(_this, "string")
    if (!_this.value.match(/[a-z].com|[a-z].info|[a-z].org/g)) {
        _this.parent.errors[_this.originField] = _this.message
    }
    if (!_this.value.match(/[a-z]@/g)) {
        _this.parent.errors[_this.originField] = _this.message
    }
}
function chainEnums(_this, value) {
    if (_isPassed(_this)) return _this
    if (!value.includes(_this.value)) _this.parent.errors[_this.originField] = _this.message
}
function chainBool(_this) {
    if (_isPassed(_this)) return _this
    _performValidate(_this, "boolean")
}
function chainObjectId(_this) {
    if (_isPassed(_this)) return _this
    if (!_this.value.toString().match(/^[0-9a-fA-F]{24}$/)) {
        _this.parent.errors[_this.originField] = _this.message
    }
}
function chainUuid(version, _this) {
    if (!Number.isInteger(version)) throw new Error("Invalid version given type must be integer")

    if (_isPassed(_this)) return _this

    let regex = _this.regexUUID // default

    if (version === 1) regex = _this.regexUUIDV1
    if (version === 2) regex = _this.regexUUIDV2
    if (version === 3) regex = _this.regexUUIDV3
    if (version === 4) regex = _this.regexUUIDV4
    if (version === 5) regex = _this.regexUUIDV5

    if (!_this.value.toString().match(regex)) {
        _this.parent.errors[_this.originField] = _this.message
    }
}

function chainArray(option, _this) {
    _this.value = _this._body[_this.field]
    if (_isPassed(_this) && !(option.maxLength || option.minLength)) return _this
    if (!Array.isArray(_this.value)) {
        _this.parent.errors[_this.originField + ".type"] = _this.message
    }

    if (option.minLength && _this.value.length < option.minLength) {
        _this.parent.errors[_this.originField] = _this.message
    }

    if (option.maxLength && _this.value.length > option.maxLength) {
        _this.parent.errors[_this.originField] = _this.message
    }
}

function chainObject(allowEmptyObject = false, _this) {
    if (!_isPassed(_this)) {
        _performValidate(_this, "object")
    }
    if (Array.isArray(_this.value)) {
        _this.parent.errors[_this.originField] = _this.message
    }

    if (!allowEmptyObject && Object.keys(_this.value).length < 1) {
        _this.parent.errors[_this.originField] = _this.message
    }
}

function chainMustExistIn(modelName, option = { key: null, skipKey: null, as: null, message: null }, _this) {
    option = { key: null, skipKey: null, as: null, message: null, ...option }
    if (typeof modelName !== "string" && modelName && modelName.modelName) modelName = modelName.modelName
    // console.log(this.mongoose)
    let findField = _this.field.split(".")
    findField = findField[findField.length - 1]

    if (option.key) findField = option.key

    const indexContext = _this.parent.context.length
    _this.parent.context[indexContext] = {
        key: findField,
        value: _this.value,
        as: option.as || modelName,
        model: modelName,
        option,
        message: option.message || _this.message,
        logicType: LOGIC_TYPE.MUST_EXIST
    }
}

function chainMustNotExistIn(modelName, option = { key: null, skipKey: null, as: null, message: null }, _this) {
    if (!key) {
        console.error("Please specific key to work with mongoos validator")
        return
    }
    option = { key: null, skipKey: null, as: null, message: null, ...option }
    if (typeof modelName !== "string" && modelName && modelName.modelName) modelName = modelName.modelName

    const indexContext = _this.parent.context.length
    _this.parent.context[indexContext] = {
        key,
        value: _this.value,
        as: option.as || modelName,
        model: modelName,
        option,
        message: option.message || _this.message,
        logicType: LOGIC_TYPE.MUST_NOT_EXIST
    }
}

function chainMongoose(modelName, option = { key: null, skipKey: null, as: null, message: null, operator: "$eq" }, _this, type) {
    if (!option.key) {
        throw new ("Please specific key to work with mongoos validator")
    }
    option = { key: null, skipKey: null, as: null, message: null, ...option }
    if (typeof modelName !== "string" && modelName && modelName.modelName) modelName = modelName.modelName

    _this.parent.context[_this.parent.context.length] = {
        key: option.key,
        value: _this.value,
        as: option.as || _this.field,
        model: modelName,
        option,
        message: option.message || _this.message,
        logicType: type,
        operator: option.operator
    }
}

function chainDate(_this) {
    if (!_isPassed(_this)) {
        const date = new Date(_this.value)
        if (date.toString() === "Invalid Date") _this.parent.errors[_this.originField] = _this.message
    }
}

function chainFile(_this) {
    if (!_isPassed(_this)) {
        let findField = _this.field.split(".")
        findField = findField[findField.length - 1]
        const files = _this.parent.req.files
        if (Array.isArray(files[findField])) {
            _this.parent.errors[findField] = _this.message
            return
        }
        if (!files || !files[findField] || !files[findField].filename) {
            _this.parent.errors[findField] = _this.message
        }
    }
}

function chainFiles(_this) {
    if (!_isPassed(_this)) {
        let findField = _this.field.split(".")
        findField = findField[findField.length - 1]
        const files = _this.parent.req.files

        if (files && files[findField]) return

        if (!Array.isArray(files[findField])) {
            _this.parent.errors[findField] = _this.message
            return
        }
        _this.parent.errors[findField] = _this.message
    }
}
function chainCustom(callback, _this) {
    const isPass = callback(_this.value, _this.parent)
    if (!isPass) _this.parent.errors[_this.originField] = _this.message
}

function _performValidate(_this, typeName) {
    if (typeof _this.value !== typeName) {
        _this.parent.errors[_this.originField + ".type"] = _this.message
        return false
    }
    if (_this.required && _isEmpty(_this)) _this.parent.errors[_this.originField] = _this.message
    if (!_this.allowNull && _isEmpty(_this)) _this.parent.errors[_this.originField] = _this.message
    return true
}
function _performNoTypeValidate(_this) {
    if (_this.required && _isEmpty(_this)) _this.parent.errors[_this.originField] = _this.message
    if (!_this.allowNull && _isEmpty(_this)) _this.parent.errors[_this.originField] = _this.message
    return true
}
function _isEmpty(_this) {
    return _this.value === "" || _this.value === null || _this.value === undefined || _this.value === {}
}
function _isPassed(_this, value) {
    if (_this.allowNull && _isEmpty(_this)) {
        return true
    }

    if (_this.required && _isEmpty(_this)) {
        return false
    }

    if (!_this.allowNull && _isEmpty(_this)) {
        return true
    }

    return false
}

function _performArrayValidate(_this, callback) {
    const field = _this.field
    const convertedBody = _this.convertedBody
    let isRunned = false

    function dynamicFindValidate(_field) {
        let splitArg = "*."
        if (_field.match(/.\*\./g)) {
            splitArg = ".*."
        } else if (_field.match(/.\*/g)) {
            splitArg = ".*"
        }

        const splitField = _field.split(splitArg)
        if (splitField.length > 2) throw new Error("VaidaorError: Now not support nested array, Only support for object in array only")
        if (splitField.length === 2) {
            isRunned = true
            let mainField = splitField[0]
            let fieldInArray = splitField[1];

            if (splitArg === "*.") {
                mainField = "*"
                fieldInArray = splitField[1];
            }

            if (splitArg === ".*") fieldInArray = "0"

            for (let i = 0; i < _this._body[mainField].length; i++) {
                const validateField = `${mainField}.${i}.${fieldInArray}`
                const value = convertedBody[validateField]
                _this.value = value
                callback(value)
            }
        }
    }
    dynamicFindValidate(field)

    return isRunned
}

module.exports = {
    chainString,
    chainIP,
    chainNumber,
    chainInt,
    chainEmail,
    chainEnums,
    chainBool,
    chainObjectId,
    chainUuid,
    _performValidate,
    _performNoTypeValidate,
    _isEmpty,
    _isPassed,
    _performArrayValidate,
    chainArray,
    chainObject,
    chainMustExistIn,
    chainDate,
    chainFile,
    chainFiles,
    chainCustom,
    chainMustNotExistIn,
    chainMongoose,
    LOGIC_TYPE
}