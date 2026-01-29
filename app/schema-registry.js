"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = registerSchema;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const node_fetch_1 = __importDefault(require("node-fetch"));
const graphql_1 = require("graphql");
const config_1 = __importDefault(require("./config"));
const logger_1 = require("./logger");
const packageJson = JSON.parse(fs_1.default.readFileSync((0, path_1.resolve)('package.json'), 'utf8'));
async function postData(url = '', data = {}) {
    const response = await (0, node_fetch_1.default)(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        logger_1.logger.error(`schema-registry response code ${response.status}: ${response.statusText}`);
        return false;
    }
    return await response.json();
}
async function registerSchema(schema) {
    const url = `${config_1.default.schemaRegistryHost}/schema/push`;
    let version = "latest";
    try {
        version = fs_1.default.readFileSync((0, path_1.resolve)('.version'), "utf8").trim();
    }
    catch (e) {
        logger_1.logger.warn('No .version file found, using "latest"');
    }
    try {
        await postData(url, {
            "name": packageJson.name,
            "url": config_1.default.selfUrl,
            "version": process.env.ENV_ID === 'dev' ? "latest" : version,
            "type_defs": (0, graphql_1.print)(schema)
        });
        logger_1.logger.info('Schema registered successfully');
    }
    catch (e) {
        logger_1.logger.error(e);
    }
}
//# sourceMappingURL=schema-registry.js.map