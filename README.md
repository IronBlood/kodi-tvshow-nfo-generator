# Kodi nfo generator for TV shows

[中文说明](./README-zh.md)

This is a simple node-based command-line tool to generate [\*.nfo files for TV shows](https://kodi.wiki/view/NFO_files/TV_shows). To generate \*.nfo files for movies, please check out [Peter Reutemann's kodi-nfo-generator](https://github.com/fracpete/kodi-nfo-generator).

IMDb will be used as the data source for genres, ratings, thumbs, etc.

## Installation

[Node.js](https://nodejs.org/) is required as the running environment. After installing node.js, you may install this tools with this command:

```bash
npm install -g kodi-tvshow-nfo-generator
```

## Usage

```bash
kodi-tvshow-nfo-generator /path/to/directory_1 /path/to/directory_2 ...
```

If no directory is provided in arguments, the current working directory will be used. You need to provide a `tvshow.json` file in each directory, the content looks like this:

```json
	"id": "tt0000000",
	"title": "Foo (2021- )",
	"seasons": [1,2,3]
```

* `id`: The ID of a show on IMDb, e.g. `tt0898266` is for [The Big Bang Theory (2007-2019)](https://www.imdb.com/title/tt0898266/).
* `title`: The title of a show, and it will be used to name each nfo file, e.g. `Foo (2021- ) S04E02.nfo`. This is required by [Kodi wiki/Naming video files/TV shows](https://kodi.wiki/view/Naming_video_files/TV_shows).
* `seasons`: An array of season numbers.

If everything goes well, the directory will look like this:

```
Foo (2021- )
├── Season 1
│   ├── Foo (2021– ) S01E01.nfo
│   ├── Foo (2021– ) S01E02.nfo
│   └── ......
├── Season 2
├── Season 3
├── tvshow.json
└── tvshow.nfo
```

You may need to copy, move or create symlinks to the original video files, and the target name should keep the same as the `nfo` file, e.g. `Foo (2021- ) S01E01.mkv`.

## License
MIT

