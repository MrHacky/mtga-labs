export function flattenObjects(objlist) {
	return Object.assign({}, ...objlist);
}

export function objectMap(object, mapFn) {
	return Object.keys(object).reduce(function(result, key) {
		result[key] = mapFn(object[key])
		return result
	}, {})
}
