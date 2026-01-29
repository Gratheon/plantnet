"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = storage;
exports.isStorageConnected = isStorageConnected;
exports.initStorage = initStorage;
const config_1 = __importDefault(require("./config"));
const mysql_1 = __importStar(require("@databases/mysql"));
const logger_1 = require("./logger");
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
let db;
let isConnected = false;
let reconnectInterval = null;
function storage() {
    return db;
}
function isStorageConnected() {
    return isConnected;
}
async function tryConnect() {
    try {
        const baseDsn = `mysql://${config_1.default.mysql.user}:${config_1.default.mysql.password}@${config_1.default.mysql.host}:${config_1.default.mysql.port}`;
        const poolOptions = `?connectionLimit=5&waitForConnections=true`;
        const conn = (0, mysql_1.default)(`${baseDsn}/${poolOptions}`);
        await conn.query((0, mysql_1.sql) `CREATE DATABASE IF NOT EXISTS \`plantnet\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`);
        await conn.query((0, mysql_1.sql) `CREATE DATABASE IF NOT EXISTS \`logs\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`);
        await conn.dispose();
        db = (0, mysql_1.default)({
            connectionString: `${baseDsn}/${config_1.default.mysql.database}${poolOptions}`,
            bigIntMode: 'number',
            poolSize: 3,
            maxUses: 200,
            idleTimeoutMilliseconds: 120000,
            queueTimeoutMilliseconds: 60000,
            onError: (err) => {
                var _a;
                if (!((_a = err.message) === null || _a === void 0 ? void 0 : _a.includes('packets out of order'))) {
                    logger_1.logger.error(`MySQL connection pool error: ${err.message}`);
                }
            },
        });
        await db.query((0, mysql_1.sql) `SELECT 1`);
        isConnected = true;
        logger_1.logger.info('Successfully connected to MySQL database');
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
        await migrate();
        return true;
    }
    catch (err) {
        isConnected = false;
        logger_1.logger.error('Failed to connect to MySQL', { error: err });
        return false;
    }
}
async function migrate() {
    try {
        await db.query((0, mysql_1.sql) `CREATE TABLE IF NOT EXISTS _db_migrations (
            hash VARCHAR(255),
            filename VARCHAR(255),
            executionTime DATETIME
        );`);
        if (!fs_1.default.existsSync('./migrations')) {
            logger_1.logger.info('No migrations directory found, skipping migrations');
            return;
        }
        const files = await fs_1.default.promises.readdir('./migrations');
        const sqlFiles = files.filter((file) => file.endsWith('.sql')).sort();
        for (const file of sqlFiles) {
            logger_1.logger.info(`Processing DB migration ${file}`);
            const sqlStatement = await fs_1.default.promises.readFile(`./migrations/${file}`, 'utf8');
            const hash = crypto_1.default
                .createHash('sha256')
                .update(sqlStatement)
                .digest('hex');
            const rows = await db.query((0, mysql_1.sql) `SELECT * FROM _db_migrations WHERE hash = ${hash}`);
            if (rows.length === 0) {
                await db.tx(async (dbi) => {
                    await dbi.query(mysql_1.sql.file(`./migrations/${file}`));
                });
                logger_1.logger.info(`Successfully executed SQL from ${file}`);
                await db.query((0, mysql_1.sql) `INSERT INTO _db_migrations (hash, filename, executionTime) VALUES (${hash}, ${file}, NOW())`);
                logger_1.logger.info(`Successfully stored migration hash for ${file}`);
            }
            else {
                logger_1.logger.info(`SQL from ${file} has already been executed. Skipping.`);
            }
        }
    }
    catch (err) {
        logger_1.logger.error('Migration error', { error: err });
    }
}
async function initStorage() {
    const connected = await tryConnect();
    if (!connected) {
        logger_1.logger.warn('Initial MySQL connection failed. Will retry every 10 seconds...');
        reconnectInterval = setInterval(async () => {
            logger_1.logger.info('Attempting to reconnect to MySQL...');
            await tryConnect();
        }, 10000);
    }
}
//# sourceMappingURL=storage.js.map