import minimatch from 'minimatch';
import through   from 'through2';

const store = new Map();

function exist(key, mask = false) {

	if (store.has(key)) {

		const files = store.get(key);

		if (!files.length) {
			return false;
		}

		if (files.some(_ => !mask || minimatch(_.path, mask))) {
			return true;
		}
	}

	return false;
}

function push(key, files) {

	if (!store.has(key)) {
		store.set(key, []);
	}

	store.set(key, files);
}

function shift(key, mask = false) {

	if (!store.has(key)) {
		return [];
	}

	return store.get(key).filter(_ => !mask || minimatch(_.path, mask));
}

export function away(mask = false) {
	return through.obj((file, enc, next) => {

		if (!mask || minimatch(file.path, mask)) {
			return next();
		}

		return next(null, file);
	});
}

export function from(key, mask = false) {

	const files = [];

	return through.obj((file, enc, next) => {

		if (!mask || minimatch(file.path, mask)) {
			files.push(file);
			return next();
		}

		return next(null, file);

	}, function flush(next) {
		push(key, files);
		next();
	});
}

export function to(key, mask = false) {
	return through.obj((file, enc, next) => {
		next(null, file);
	}, function flush(next) {
		shift(key, mask).forEach(_ => this.push(_));
		next();
	});
}

export function get(key, _maskOrToString, _toString) {

	const mask = typeof _maskOrToString == 'string'
			? _maskOrToString
			: false,
		toString = _toString || typeof _maskOrToString == 'boolean' && _maskOrToString;

	let files = shift(key, mask);

	if (toString) {
		files = files.map(_ => _.contents.toString('utf8'));
	}

	return files;
}

export function wait(key, mask = false, timeout = 500) {
	return through.obj((file, enc, next) => {

		if (exist(key, mask)) {
			next(null, file);
			return;
		}

		const waitInterval = setInterval(() => {

			if (exist(key, mask)) {
				clearInterval(waitInterval);
				next(null, file);
				return;
			}

		}, timeout);
	});
}
