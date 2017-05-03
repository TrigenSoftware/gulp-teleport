import { Readable } from 'readable-stream';
import minimatch    from 'minimatch';
import through      from 'through2';
import Vinyl        from 'vinyl';
import * as Store   from './store';

export function get(keyMaskOrArray, pathMask = false) {
	return Store.shift(keyMaskOrArray, pathMask);
}

export function set(key, files) {
	Store.push(key, files.filter(_ => Vinyl.isVinyl(_)));
}

export function away(pathMask = false) {
	return through.obj((file, enc, next) => {

		if (!pathMask || minimatch(file.path, pathMask)) {
			return next();
		}

		return next(null, file);
	});
}

export function clone(key, pathMask = false) {

	const files = [];

	return through.obj((file, enc, next) => {

		if (!pathMask || minimatch(file.path, pathMask)) {
			files.push(file.clone({ contents: false }));
		}

		return next(null, file);

	}, function flush(next) {
		Store.push(key, files);
		next();
	});
}

export function to(key, pathMask = false) {

	const files = [];

	return through.obj((file, enc, next) => {

		if (!pathMask || minimatch(file.path, pathMask)) {
			files.push(file);
			return next();
		}

		return next(null, file);

	}, function flush(next) {
		set(key, files);
		next();
	});
}

export function from(keyMaskOrArray, pathMask = false) {
	return through.obj((file, enc, next) => {
		next(null, file);
	}, function flush(next) {
		get(keyMaskOrArray, pathMask).forEach(_ =>
			this.push(_)
		);
		next();
	});
}

export function stream(keyMaskOrArray, pathMask = false) {

	const stream = new Readable({
		objectMode:    true,
		highWaterMark: 16
	});

	stream._read = () => {};

	get(keyMaskOrArray, pathMask).forEach(_ =>
		stream.push(_)
	);
	stream.push(null);

	return stream;
}

export function waitStream(keyMaskOrArray, pathMask = false, timeout) {

	const stream = new Readable({
		objectMode:    true,
		highWaterMark: 16
	});

	stream._read = () => {};

	waitStoreGroup(keyMaskOrArray, pathMask, timeout).then(() => {
		get(keyMaskOrArray, pathMask).forEach(_ =>
			stream.push(_)
		);
		stream.push(null);
	});

	return stream;
}

export function wait(keyMaskOrArray, pathMask = false, timeout) {
	return through.obj((file, enc, next) => {
		waitStoreGroup(keyMaskOrArray, pathMask, timeout).then(() => {
			next(null, file);
		});
	});
}

function waitStoreGroup(keyMaskOrArray, pathMask = false, timeout = 500) {
	return new Promise((resolve) => {

		if (Store.exist(keyMaskOrArray, pathMask)) {
			resolve();
			return;
		}

		const waitInterval = setInterval(() => {

			if (Store.exist(keyMaskOrArray, pathMask)) {
				clearInterval(waitInterval);
				resolve();
				return;
			}

		}, timeout);
	});
}
