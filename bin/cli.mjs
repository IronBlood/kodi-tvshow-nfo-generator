#!/usr/bin/env node

import { get_dirs, generate } from "../src/index.js";

for (const dir of get_dirs()) {
	await generate(dir);
}

