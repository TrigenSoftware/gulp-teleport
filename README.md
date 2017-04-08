[![NPM](https://nodei.co/npm/gulp-teleport.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/gulp-teleport/)

# gulp-teleport

Teleport for stream chunks.

# Getting Started

Install with npm
```bash
npm i -D gulp-teleport
```
or
```bash
yarn add -D gulp-teleport
```

# About

By using this plugin you can teleport files between streams.

# API

#### `away(String globMask = false)`

Teleport away files matched by mask.

#### `from(String groupName, String globMask = false)`

Teleport files matched by mask from current stream.

#### `to(String groupName, String globMask = false)`

Teleport files matched by mask to current stream.

#### `get(String groupName, [String globMask = false,] Boolean toString = false)`

Get files from store by group name.

#### `wait(String groupName, String globMask = false, Number interval = 500)`

Wait group of files.

# Example 
```js
const gulp   = require('gulp'),
	favicons = require('gulp-favicons'),
	htmlmin  = require('gulp-htmlmin'),
	teleport = require('gulp-teleport');

gulp.task('favicon', () => 
	gulp.src('src/favicon.svg')
		.pipe(favicon({
			...
			path:     'favicons/',
			html:     'favicons.html',
			pipeHTML: true
		}))
		.pipe(teleport.from('favicons', '**/*.html'))
		.pipe(gulp.dest('dist/favicons'))
);

gulp.task('html', gulp.series('favicon', () =>
	gulp.src(paths.html)
		.pipe(teleport.wait('favicons'))
		.pipe(replace(
			'<link rel="shortcut icon" href="favicon.svg">',
			() => teleport.get('favicons', true).join(''))
		))
		.pipe(htmlmin({...}))
		.pipe(gulp.dest('dist'))
));
```
