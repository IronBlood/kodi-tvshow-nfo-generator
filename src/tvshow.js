import fs from "fs";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import format from "xml-formatter";

import { IMDB_SITE } from "./constants.js";

import {
	parse_tvshow_json,
	create_xml_root,
	serialize_xml,
	xml_set_text,
	get_nfo_filename,
} from "./utils.js"

import {
	TVShow,
	Episode,
	IMDBMeta,
} from "./types.js";

/**
 * @param {String} id
 * @param {number} season
 * @return {Promise<Episode[]>}
 */
const get_episode_list = async (id, season) => {
	const url = `${IMDB_SITE}/title/${id}/episodes/?season=${season}`;
	const response = await fetch(url);
	if (!response.ok)
		return [];
	const body = await response.text();
	const dom = new JSDOM(body);
	const $list = [].slice.call(dom.window.document.querySelectorAll(".list_item"));
	return $list.map($episode => {
		/** @param {HTMLAnchorElement} */
		const anchor = $episode.querySelector(".info a");
		const url = anchor.getAttribute("href");
		const episode = +url.split("_ep")[1];
		return { url, episode };
	});
};

/**
 * @param {String} url
 * @return {Promise<String>} xml content of an episode nfo
 */
const get_episode = async (url) => {
	const response = await fetch(`${IMDB_SITE}${url}`);
	if (!response.ok)
		return "";

	const body = await response.text();
	const dom = new JSDOM(body);

	/** @type {IMDBMeta} */
	const meta_json = JSON.parse(dom.window.document.querySelector("script[type='application/ld+json']").innerHTML);

	const xmlDoc = create_xml_root("episodedetails");
	const xmlRoot = xmlDoc.getElementsByTagName("episodedetails")[0];

	// XML title node
	const xml_title = xmlDoc.createElement("title");
	xml_set_text(xmlDoc, xml_title, meta_json.name);
	xmlRoot.appendChild(xml_title);

	// XML uniqueid node
	const xml_uniqueid = xmlDoc.createElement("uniqueid");
	xml_uniqueid.setAttribute("type", "imdb");
	xml_set_text(xmlDoc, xml_uniqueid, meta_json.url.split("/")[2]);
	xmlRoot.appendChild(xml_uniqueid);

	// XML plot node
	const xml_plot = xmlDoc.createElement("plot");
	xml_set_text(xmlDoc, xml_plot, meta_json.description);
	xmlRoot.appendChild(xml_plot);

	// XML director nodes
	for (const d of meta_json.director) {
		const xml_director = xmlDoc.createElement("director");
		xml_set_text(xmlDoc, xml_director, d.name);
		xmlRoot.appendChild(xml_director);
	}

	// XML aired node
	const xml_aired = xmlDoc.createElement("aired");
	xml_set_text(xmlDoc, xml_aired, meta_json.datePublished);
	xmlRoot.appendChild(xml_aired);

	// rating
	if (meta_json.aggregateRating && meta_json.aggregateRating.ratingValue && meta_json.aggregateRating.ratingCount) {
		const xml_ratings = xmlDoc.createElement("ratings");
		const xml_rating  = xmlDoc.createElement("rating");
		xml_rating.setAttribute("name", "imdb");
		xml_rating.setAttribute("max", "10");
		const xml_rating_value = xmlDoc.createElement("value");
		const xml_rating_votes = xmlDoc.createElement("votes");
		xml_set_text(xmlDoc, xml_rating_value, meta_json.aggregateRating.ratingValue);
		xml_set_text(xmlDoc, xml_rating_votes, meta_json.aggregateRating.ratingCount);
		xml_rating.appendChild(xml_rating_value);
		xml_rating.appendChild(xml_rating_votes);
		xml_ratings.appendChild(xml_rating);
		xmlRoot.appendChild(xml_ratings);
	}

	// poster
	/** @type {HTMLAnchorElement} */
	const thumb_anchor = dom.window.document.querySelector("a[aria-label='View {Title} Poster']");
	if (thumb_anchor != null) {
		const url_thumb_small_img = thumb_anchor.parentElement.querySelectorAll(".ipc-image")[0].src;
		const url_thumb_img = meta_json.image;
		const xml_thumb = xmlDoc.createElement("thumb");
		xml_thumb.setAttribute("aspect", "thumb");
		xml_thumb.setAttribute("preview", url_thumb_small_img);
		xml_set_text(xmlDoc, xml_thumb, url_thumb_img);
		xmlRoot.appendChild(xml_thumb);
	}

	return format(serialize_xml(xmlDoc), { collapseContent: true });
}

/**
 * Parse and return the JSON content of tvshow.json
 * @param {String} path Path of the folder to generate nfo files.
 * @return {TVShow|null}
 */
export const get_tvshow = path => {
	path = `${path}/tvshow.json`;
	if (!fs.existsSync(path))
		return null;

	const content = fs.readFileSync(path).toString();
	return parse_tvshow_json(content);
};

/**
 * @param {String} path Path of the folder to generate nfo files.
 * @param {TVShow} tvshow
 */
export const generate_tvshow = async (path, tvshow) => {
	const tvshow_filename = `${path}/tvshow.nfo`;
	if (fs.existsSync(tvshow_filename)) {
		console.log(`${tvshow_filename} exists, skip`);
	} else {
		const url = `${IMDB_SITE}/title/${tvshow.id}/`;
		let body;

		try {
			const response = await fetch(url);
			if (!response.ok)
				throw new Error(response.statusText);
			body = await response.text();
		} catch (e) {
			/** @type Error */
			let err = e;
			console.error(`Cannot parse ${url}: ${err.message}`);
			return;
		}

		const dom = new JSDOM(body);
		const json_script = dom.window.document.querySelector("script[type='application/ld+json']");
		/** @type {IMDBMeta} */
		const meta_json = JSON.parse(json_script.innerHTML);

		const xmlDoc = create_xml_root("tvshow");
		const xmlRoot = xmlDoc.getElementsByTagName("tvshow")[0];

		// XML title node
		const xml_title = xmlDoc.createElement("title");
		xml_set_text(xmlDoc, xml_title, tvshow.title);
		xmlRoot.appendChild(xml_title);

		// XML plot node
		const xml_plot = xmlDoc.createElement("plot");
		xml_set_text(xmlDoc, xml_plot, meta_json.description);
		xmlRoot.appendChild(xml_plot);

		// XML uniqueid node
		const xml_uniqueid = xmlDoc.createElement("uniqueid");
		xml_uniqueid.setAttribute("type", "imdb");
		xml_set_text(xmlDoc, xml_uniqueid, tvshow.id);
		xmlRoot.appendChild(xml_uniqueid);

		// XML genre nodes
		for (const genre of meta_json.genre) {
			const xml_genre = xmlDoc.createElement("genre");
			xml_set_text(xmlDoc, xml_genre, genre);
			xmlRoot.appendChild(xml_genre);
		}

		// XML premiered node
		const xml_premiered = xmlDoc.createElement("premiered");
		xml_set_text(xmlDoc, xml_premiered, meta_json.datePublished);
		xmlRoot.appendChild(xml_premiered);

		// rating
		if (meta_json.aggregateRating && meta_json.aggregateRating.ratingValue && meta_json.aggregateRating.ratingCount) {
			const xml_ratings = xmlDoc.createElement("ratings");
			const xml_rating  = xmlDoc.createElement("rating");
			xml_rating.setAttribute("name", "imdb");
			xml_rating.setAttribute("max", "10");
			const xml_rating_value = xmlDoc.createElement("value");
			const xml_rating_votes = xmlDoc.createElement("votes");
			xml_set_text(xmlDoc, xml_rating_value, meta_json.aggregateRating.ratingValue);
			xml_set_text(xmlDoc, xml_rating_votes, meta_json.aggregateRating.ratingCount);
			xml_rating.appendChild(xml_rating_value);
			xml_rating.appendChild(xml_rating_votes);
			xml_ratings.appendChild(xml_rating);
			xmlRoot.appendChild(xml_ratings);
		}

		// poster
		/** @type {HTMLAnchorElement} */
		const poster_anchor = dom.window.document.querySelector("a[aria-label='View {Title} Poster']");
		if (poster_anchor != null) {
		const url_poster_small_img = poster_anchor.parentElement.querySelectorAll(".ipc-image")[0].src;
		const url_poster_img = meta_json.image;
			const xml_thumb_poster = xmlDoc.createElement("thumb");
			xml_thumb_poster.setAttribute("aspect", "poster");
			xml_thumb_poster.setAttribute("preview", url_poster_small_img);
			xml_set_text(xmlDoc, xml_thumb_poster, url_poster_img);
			xmlRoot.appendChild(xml_thumb_poster);
		}

		const tvshow_xmlstr = format(serialize_xml(xmlDoc), { collapseContent: true, })

		fs.writeFileSync(tvshow_filename, tvshow_xmlstr);
		console.log(`${tvshow_filename} created`);
	}

	for (const k of tvshow.seasons) {
		const dir_path = `${path}/Season ${k}`;
		if (!fs.existsSync(dir_path)) {
			fs.mkdirSync(dir_path);
			console.log(`${dir_path} created`);
		}

		if (!fs.lstatSync(dir_path).isDirectory()) {
			// not a directory, do not modify anything
			console.log(`${dir_path} exists, but now a directory, skip`);
			continue;
		}

		const episodes = await get_episode_list(tvshow.id, k);
		for (const e of episodes) {
			const nfo_filename = get_nfo_filename(dir_path, tvshow.title, k, e.episode);
			if (fs.existsSync(nfo_filename)) {
				console.log(`${nfo_filename} exists, skip`);
			} else {
				const episode_xmlstr = await get_episode(e.url);
				fs.writeFileSync(nfo_filename, episode_xmlstr);
				console.log(`${nfo_filename} created`);
			}
		}
	}
};

