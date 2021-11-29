# Kodi nfo generator for TV shows

这是一个命令行工具，用来生成添加电视剧到 kodi 库所需要的 `*.nfo` 文件。如您需要生成电影所需的 `*.nfo` 文件，可以参考 [kodi-nfo-generator](https://github.com/fracpete/kodi-nfo-generator) 这个工具。

本工具使用 IMDb 作为数据源，爬去剧集的分类、评分、海报等信息，并按照所选季生成对应整季的 `nfo` 文件。

## 依赖和安装

本工具依赖 [node.js](https://nodejs.org/) 运行环境，可以使用 `npm` 安装：

```bash
npm install -g kodi-tvshow-nfo-generator
```

## 使用

```bash
kodi-tvshow-nfo-generator /path/to/directory_1 /path/to/directory_2 ...
```

如果不附带参数，默认使用当前的工作目录。

目标目录下需要提供对应电视剧元信息的 `tvshow.json` 文件，其格式如下：
```json
{
	"id": "tt0000000",
	"title": "Foo (2021- )",
	"seasons": [1,2,3]
}
```

其中：

* `id`: IMDb 编号，例如 `tt0898266` 对应 [The Big Bang Theory (2007-2019)](https://www.imdb.com/title/tt0898266/)
* `title`: 剧集的标题，将会被用于命名单季的文件，例如 `Foo (2021- ) S04E02.nfo`
* `seasons`: 数组，需要爬取的季编号。

正常情况运行完成后，该目录下会包含如下文件：

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

您需要将对应的视频文件移动、复制或者创建软链接到对应目录下，且保持和对应 `nfo` 同名，例如 `Foo (2021- ) S01E01.mkv`。之后在 kodi 中设置目录类型为剧集，使用本地信息作为数据源。

## 许可
MIT

