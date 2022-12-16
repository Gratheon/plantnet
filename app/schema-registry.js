import fs from 'fs';
import { resolve, dirname } from 'path';
import fetch from "node-fetch";
import { print } from "graphql";
import config from "../config/config.js";

const packageJson = JSON.parse(fs.readFileSync(resolve('package.json'), 'utf8'));

async function postData(url = '', data = {}) {
	// Default options are marked with *
	const response = await fetch(url, {
		method: 'POST',
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'same-origin', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/json'
		},
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer', // no-referrer, *client
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	});

	if (!response.ok){
		console.error(`schema-registry respose code ${response.status}: ${response.statusText}`);
		return false;
	}
	return await response.json(); // parses JSON response into native JavaScript objects
}

export async function registerSchema(schema) {
	const url = `${config.schemaRegistryHost}/schema/push`
	const version = fs.readFileSync("./.version", "utf8");

	try{
		await postData(url, {
			"name": packageJson.name,
			"url": config.selfUrl,
			"version": process.env.ENV_ID === 'dev' ? "latest" : version,
			"type_defs": print(schema)
		});
	} catch (e){
		console.error(e);
	}
}
