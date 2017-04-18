import minimatch from 'minimatch';

const store = new Map();

export function someKey(keyMaskOrArray) {

	const keyMasks = Array.isArray(keyMaskOrArray)
			? keyMaskOrArray
			: [keyMaskOrArray],
		keys = Array.from(store.keys());

	return keyMasks.every(keyMask =>
		keys.some(_ => minimatch(_, keyMask))
	);
}

export function keys(keyMaskOrArray) {

	const keyMasks = Array.isArray(keyMaskOrArray)
			? keyMaskOrArray
			: [keyMaskOrArray],
		keys = Array.from(store.keys());

	return keys.filter(_ =>
		keyMasks.some(keyMask => minimatch(_, keyMask))
	);
}

export function values(keyMaskOrArray) {
	return keys(keyMaskOrArray)
		.map(k => store.get(k))
		.reduce((values, v) => values.concat(v), []);
}

export function exist(keyMaskOrArray, pathMask = false) {

	if (someKey(keyMaskOrArray)) {

		const files = values(keyMaskOrArray);

		if (!files.length) {
			return false;
		}

		if (files.some(_ => !pathMask || minimatch(_.path, pathMask))) {
			return true;
		}
	}

	return false;
}

export function push(key, files) {

	if (!store.has(key)) {
		store.set(key, []);
	}

	store.set(key, files);
}

export function shift(keyMaskOrArray, pathMask = false) {

	if (!someKey(keyMaskOrArray)) {
		return [];
	}

	return values(keyMaskOrArray).filter(_ => !pathMask || minimatch(_.path, pathMask));
}
