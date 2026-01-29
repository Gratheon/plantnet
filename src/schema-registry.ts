import fs from 'fs';
import { resolve } from 'path';
import fetch from "node-fetch";
import { print } from "graphql";
import config from "./config";
import { logger } from './logger';

interface PackageJson {
    name: string;
    version: string;
}

const packageJson: PackageJson = JSON.parse(fs.readFileSync(resolve('package.json'), 'utf8'));

async function postData(url: string = '', data: any = {}): Promise<any> {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        logger.error(`schema-registry response code ${response.status}: ${response.statusText}`);
        return false;
    }
    return await response.json();
}

export async function registerSchema(schema: any): Promise<void> {
    const url = `${config.schemaRegistryHost}/schema/push`;
    
    let version = "latest";
    try {
        version = fs.readFileSync(resolve('.version'), "utf8").trim();
    } catch (e) {
        logger.warn('No .version file found, using "latest"');
    }

    try {
        await postData(url, {
            "name": packageJson.name,
            "url": config.selfUrl,
            "version": process.env.ENV_ID === 'dev' ? "latest" : version,
            "type_defs": print(schema)
        });
        logger.info('Schema registered successfully');
    } catch (e) {
        logger.error(e as Error);
    }
}
