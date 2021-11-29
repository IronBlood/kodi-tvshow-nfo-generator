import {
	DOMImplementation,
	XMLSerializer,
} from "@xmldom/xmldom";
import { TVShow } from "./types.js"

/**
 * Parse and validate tvshow.json
 * @param {String} content
 * @return {TVShow|null}
 */
export const parse_tvshow_json = content => {
	if (content == null)
		return null;

	/** @type {TVShow|null} */
	let obj = null;

	try {
		obj = JSON.parse(content);
		if (obj != null) {
			if (!obj.id || typeof obj.id !== "string" || !obj.id.startsWith("tt")) {
				throw "id field is missing or invalid. id should be like \"tt4786824\".";
			}

			if (!obj.title || typeof obj.title !== "string") {
				throw "title field is missing or invalid.";
			}

			if (!obj.seasons || !Array.isArray(obj.seasons)) {
				throw "seasons field is missing or invalid.";
			}

			for (const n of obj.seasons) {
				if (!Number.isInteger(n)) {
					throw "invalid season, it should be an integer.";
				}
			}
		}
	} catch (e) {
		console.error("content is not a valid JSON file.", e);
		obj = null;
	}

	return obj;
};

/**
 * @param {String} root
 * @return {XMLDocument}
 */
export const create_xml_root = root => {
	const xmlDoc = new DOMImplementation().createDocument("", root);
	const piNode = xmlDoc.createProcessingInstruction("xml", `version="1.0" encoding="UTF-8" standalone="yes"`);
	xmlDoc.insertBefore(piNode, xmlDoc.firstChild);

	return xmlDoc
};

/**
 * @param {XMLDocument}
 * @return {String}
 */
export const serialize_xml = doc => {
	const serializer = new XMLSerializer();
	return serializer.serializeToString(doc);
};

/**
 * @param {XMLDocument} doc
 * @param {HTMLElement} node
 * @param {String} text
 */
export const xml_set_text = (doc, node, text) => {
	node.appendChild(doc.createTextNode(text));
};

/**
 * Simple padding, only works for 0 < n < 100;
 * @param {number} n
 * @return {String}
 */
const number_padding = n => (n < 10) ? `0${n}` : `${n}`;

/**
 * @param {String} dir_path path of the season directory.
 * @param {String} title name of the tvshow.
 * @param {number} season
 * @param {number} episode
 * @return {String}
 */
export const get_nfo_filename = (dir_path, title, season, episode) => {
	return `${dir_path}/${title} S${number_padding(season)}E${number_padding(episode)}.nfo`;
};

