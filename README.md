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

## `Object teleport`

*gulp-teleport*

#### `away(String pathMask = false)`

Teleport away files matched by path.

#### `clone(String groupName, String pathMask = false)`

Clone files matched by path from current stream to group in storage.

#### `to(String groupName, String pathMask = false)`

Teleport files matched by path from current stream to group in storage.

#### `from(String|Array<String> groupMask, String pathMask = false)`

Teleport files matched by path to current stream from group in storage.

#### `stream(String|Array<String> groupMask, String pathMask = false)`

Get stream of files from store by group name.

#### `waitStream(String|Array<String> groupMask, String pathMask = false)`

Wait and get stream of files from store by group name.

#### `wait(String|Array<String> groupMask, String pathMask = false, Number interval = 500)`

Wait group of files.

#### `get(String|Array<String> groupMask, String pathMask = false)`

Get files from store by group name.

#### `set(String group, Array<Vinyl> files)`

Set files to store by group name.

### Example 
```js
const gulp   = require('gulp'),
    favicons = require('gulp-favicons'),
    htmlmin  = require('gulp-htmlmin'),
    teleport = require('gulp-teleport');

gulp.task('favicon', () => 
    gulp.src('src/favicon.svg')
        .pipe(favicons({
            ...
            path:     'favicons/',
            html:     'favicons.html',
            pipeHTML: true
        }))
        .pipe(teleport.to('favicons', '**/*.html'))
        .pipe(gulp.dest('dist/favicons'))
);

gulp.task('html', gulp.series('favicon', () =>
    gulp.src('src/*.html')
        .pipe(teleport.wait('favicons'))
        .pipe(replace(
            '<link rel="shortcut icon" href="favicon.svg">',
            () => teleport.get('favicons').map(_ => _.contents.toString('utf8')).join('')
        ))
        .pipe(htmlmin({...}))
        .pipe(gulp.dest('dist'))
));
```

## `class TeleportFs`

*gulp-teleport/lib/fs*

### `constructor(void handler(ReadableStream stream(String pathMask), String destinationDir), Object fs = { ...fs, mkdirp, join: path.join })`

Fs proxy contructor, compatible with Node’s own `fs` module interface.

### Example
```js
const webpackCompiler = webpack({...});

webpackCompiler.outputFileSystem = new TeleportFs((stream, dest) => {

    stream('**/rev-manifest.json')
        .pipe(teleport.to('script-rev-manifest'));

    stream('**/webpack-manifest.json')
        .pipe(teleport.clone('webpack-manifest'))
        .pipe(gulp.dest(dest));
});
```
