/* eslint no-sync: 0 */
import { Readable, Writable } from 'readable-stream';
import minimatch from 'minimatch';
import mkdirp    from 'mkdirp';
import Vinyl     from 'vinyl';
import Path      from 'path';
import Fs        from 'fs';

const defaultFs = {
	...Fs, mkdirp,
	join: Path.join.bind(Path)
};

export default class TeleportFs {

	constructor(handler, fs = defaultFs) {
		this.handler = handler;
		this.fs = fs;
	}

	_vinylify(path, content, encoding) {

		if (!content && !encoding) {
			throw new Error('No content');
		}

		const file = new Vinyl({
			path: Path.normalize(path)
		});

		if (encoding || typeof content === 'string') {
			file.contents = Buffer.from(content, encoding);
		} else
		if (content instanceof Buffer) {
			file.contents = content;
		} else {
			file.contents = null;
		}

		return file;
	}

	_createStream(close = false) {

		const stream = new Readable({
			objectMode:    true,
			highWaterMark: 16
		});

		stream._read = () => {};

		if (close) {
			stream.emit('close');
		}

		return stream;
	}

	_createPush(_path) {

		const path = Path.normalize(_path),
			streams = [];

		this.handler((mask) => {

			if (minimatch(path, mask)) {

				const stream = this._createStream();

				streams.push(stream);

				return stream;
			}

			return this._createStream(true);

		}, Path.dirname(path));

		if (!streams.length) {
			return null;
		}

		return file => streams.forEach((_) => {
			_.push(file);
			_.push(null);
		});
	}

	writeFileSync(path, content, encoding) {

		const push = this._createPush(path);

		if (push === null) {

			const proxyArgs = [path, content, encoding]
				.filter(_ => typeof _ != 'undefined');

			this.fs.writeFileSync(...proxyArgs);
			return;
		}

		push(this._vinylify(path, content, encoding));
	}

	writeFile(path, content, encodingOrCallback, _callback) {

		const push = this._createPush(path);

		if (push === null) {

			const proxyArgs = [path, content, encodingOrCallback, _callback]
				.filter(_ => typeof _ != 'undefined');

			this.fs.writeFile(...proxyArgs);
			return;
		}

		const encoding = typeof encodingOrCallback == 'string'
				? encodingOrCallback
				: global.undefined,
			callback = typeof encodingOrCallback == 'function'
				? encodingOrCallback
				: _callback;

		try {
			push(this._vinylify(path, content, encoding));
		} catch (err) {
			callback(err);
			return;
		}

		callback();
	}

	createWriteStream(path) {

		const push = this._createPush(path);

		if (push === null) {

			const proxyArgs = [path]
				.filter(_ => typeof _ != 'undefined');

			return this.fs.createWriteStream(...proxyArgs);
		}

		const stream = new Writable(),
			chunks = [];

		let len = 0;

		stream._write = (chunk, encoding, next) => {
			chunks.push(chunk);
			len += chunk.length;
			next();
		};

		stream.on('finish', () => {

			try {
				push(this._vinylify(path, Buffer.concat(chunks, len)));
			} catch (err) {
				stream.emit('error', err);
			}
		});

		return stream;
	}

	mkdirp(...args) {
		return this.fs.mkdirp(...args);
	}

	join(...args) {
		return this.fs.join(...args);
	}

	existsSync(...args) {
		return this.fs.existsSync(...args);
	}

	exists(...args) {
		return this.fs.exists(...args);
	}

	statSync(...args) {
		return this.fs.statSync(...args);
	}

	stat(...args) {
		return this.fs.stat(...args);
	}

	readFileSync(...args) {
		return this.fs.readFileSync(...args);
	}

	readFile(...args) {
		return this.fs.readFile(...args);
	}

	readdirSync(...args) {
		return this.fs.readdirSync(...args);
	}

	readdir(...args) {
		return this.fs.readdir(...args);
	}

	mkdirSync(...args) {
		return this.fs.mkdirSync(...args);
	}

	mkdir(...args) {
		return this.fs.mkdir(...args);
	}

	rmdirSync(...args) {
		return this.fs.rmdirSync(...args);
	}

	rmdir(...args) {
		return this.fs.rmdir(...args);
	}

	unlinkSync(...args) {
		return this.fs.unlinkSync(...args);
	}

	unlink(...args) {
		return this.fs.unlink(...args);
	}

	readlinkSync(...args) {
		return this.fs.readlinkSync(...args);
	}

	readlink(...args) {
		return this.fs.readlink(...args);
	}

	createReadStream(...args) {
		return this.fs.createReadStream(...args);
	}
}
