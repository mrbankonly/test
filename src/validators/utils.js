const getFieldFormObject = (data, _this) => {
    let newObject = JSON.parse(JSON.stringify(data))
    let ignoreKeys = []
    let ignoreKeyArrays = []
    let isArrayField = false


    // Convert body
    function adjustKeyObject(data) {
        const keys = Object.keys(newObject)
        // find data type = array
        const foundKeyArray = keys.find(e => Array.isArray(newObject[e]))
        // find data type = object
        const foundKey = keys.find(e => newObject[e] !== null && typeof newObject[e] === "object" && !Array.isArray(newObject[e]))

        if (foundKey && !ignoreKeys.includes(foundKey)) {
            const keyJs = Object.keys(newObject[foundKey])

            for (let i = 0; i < keyJs.length; i++) {
                const keyJ = keyJs[i];
                newObject[foundKey + "." + keyJ] = newObject[foundKey][keyJ]
            }
            delete newObject[foundKey]
            ignoreKeys.push(foundKey)
            adjustKeyObject()
        }

        if (foundKeyArray && !ignoreKeyArrays.includes(foundKeyArray)) {
            for (let j = 0; j < newObject[foundKeyArray].length; j++) {
                const keyArray = newObject[foundKeyArray][j];

                const keyJs = Object.keys(keyArray)
                for (let i = 0; i < keyJs.length; i++) {
                    const keyJ = keyJs[i];
                    const value = newObject[foundKeyArray][j][keyJ]
                    newObject[foundKeyArray + `.${j}.` + keyJ] = value
                }
            }
            ignoreKeyArrays.push(foundKeyArray)
            delete newObject[foundKeyArray]
            adjustKeyObject()
        }
    }


    adjustKeyObject()

    
    for (let i = 0; i < ignoreKeys.length; i++)  newObject[ignoreKeys[i]] = {}
    for (let i = 0; i < ignoreKeyArrays.length; i++) newObject[ignoreKeyArrays[i]] = []

    return { value: newObject, isArrayField }
}

module.exports = {
    getFieldFormObject
}