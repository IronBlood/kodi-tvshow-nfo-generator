import {
	get_tvshow,
	generate_tvshow,
} from "./tvshow.js";

/**
 * Get directories for parameters, if not provided, use current working directory.
 * return {String[]}
 */
export const get_dirs = () => {
	// 0: /path/to/node
	// 1: /path/to/script
	if (process.argv.length == 2) {
		return [ "." ];
	} else {
		return process.argv.slice(2);
	}
};

/**
 * @param {String} path
 */
export const generate = async path => {
	const tvshow = get_tvshow(path);
	if (tvshow != null)
		await generate_tvshow(path, tvshow);
};

