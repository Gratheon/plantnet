import config from './config';
import createConnectionPool, { sql, ConnectionPool } from '@databases/mysql';
import { logger } from './logger';
import fs from 'fs';
import crypto from 'crypto';

let db: ConnectionPool;
let isConnected = false;
let reconnectInterval: NodeJS.Timeout | null = null;

export function storage(): ConnectionPool {
    return db;
}

export function isStorageConnected(): boolean {
    return isConnected;
}

async function tryConnect(): Promise<boolean> {
    try {
        const baseDsn = `mysql://${config.mysql.user}:${config.mysql.password}@${config.mysql.host}:${config.mysql.port}`;
        const poolOptions = `?connectionLimit=5&waitForConnections=true&connectTimeout=10000`;
        
        // Create temporary connection without database to create databases if needed
        const conn = createConnectionPool(`${baseDsn}/${poolOptions}`);

        // Create plantnet database if it doesn't exist
        await conn.query(sql`CREATE DATABASE IF NOT EXISTS \`plantnet\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`);
        
        // Create logs database if it doesn't exist
        await conn.query(sql`CREATE DATABASE IF NOT EXISTS \`logs\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`);
        
        // Dispose of temporary connection
        await conn.dispose();

        // Create main connection pool to plantnet database
        db = createConnectionPool({
            connectionString: `${baseDsn}/${config.mysql.database}${poolOptions}`,
            bigIntMode: 'number',
            poolSize: 5,
            maxUses: 100, // Recycle connections after 100 uses
            idleTimeoutMilliseconds: 30_000, // Close idle connections after 30 seconds
            queueTimeoutMilliseconds: 60_000, // 1 minute queue timeout
            onError: (err) => {
                if (!err.message?.includes('packets out of order')) {
                    logger.error(`MySQL connection pool error: ${err.message}`);
                    
                    // If connection was closed by server, try to reconnect
                    if (err.message?.includes('disconnected by the server') || 
                        err.message?.includes('Connection lost') ||
                        err.message?.includes('PROTOCOL_CONNECTION_LOST')) {
                        isConnected = false;
                        logger.warn('Connection lost, attempting to reconnect...');
                        setTimeout(() => tryConnect(), 5000);
                    }
                }
            },
            onQueryError: (query, { text }, err) => {
                logger.error('MySQL query error', { 
                    query: text,
                    error: err.message 
                });
            },
            onConnectionOpened: () => {
                logger.debug('MySQL connection opened');
            },
            onConnectionClosed: () => {
                logger.debug('MySQL connection closed');
            },
        });

        // Test the connection
        await db.query(sql`SELECT 1`);
        
        isConnected = true;
        logger.info('Successfully connected to MySQL database');

        // Clear reconnect interval if it exists
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }

        // Run migrations
        await migrate();

        return true;
    } catch (err) {
        isConnected = false;
        logger.error('Failed to connect to MySQL', { error: err });
        return false;
    }
}

async function migrate(): Promise<void> {
    try {
        // Create migrations tracking table
        await db.query(sql`CREATE TABLE IF NOT EXISTS _db_migrations (
            hash VARCHAR(255),
            filename VARCHAR(255),
            executionTime DATETIME
        );`);

        // Check if migrations directory exists
        if (!fs.existsSync('./migrations')) {
            logger.info('No migrations directory found, skipping migrations');
            return;
        }

        // List the directory containing the .sql files
        const files = await fs.promises.readdir('./migrations');

        // Filter the array to only include .sql files
        const sqlFiles = files.filter((file) => file.endsWith('.sql')).sort();

        // Read each .sql file and execute the SQL statements
        for (const file of sqlFiles) {
            logger.info(`Processing DB migration ${file}`);
            const sqlStatement = await fs.promises.readFile(
                `./migrations/${file}`,
                'utf8'
            );

            // Hash the SQL statements
            const hash = crypto
                .createHash('sha256')
                .update(sqlStatement)
                .digest('hex');

            // Check if the SQL has already been executed by checking the hashes
            const rows = await db.query(
                sql`SELECT * FROM _db_migrations WHERE hash = ${hash}`
            );

            // If the hash is not in the table, execute the SQL and store the hash
            if (rows.length === 0) {
                await db.tx(async (dbi) => {
                    await dbi.query(sql.file(`./migrations/${file}`));
                });

                logger.info(`Successfully executed SQL from ${file}`);

                // Store the hash in the dedicated table
                await db.query(
                    sql`INSERT INTO _db_migrations (hash, filename, executionTime) VALUES (${hash}, ${file}, NOW())`
                );
                logger.info(`Successfully stored migration hash for ${file}`);
            } else {
                logger.info(`SQL from ${file} has already been executed. Skipping.`);
            }
        }
    } catch (err) {
        logger.error('Migration error', { error: err });
    }
}

export async function initStorage(): Promise<void> {
    const connected = await tryConnect();

    if (!connected) {
        logger.warn('Initial MySQL connection failed. Will retry every 10 seconds...');

        reconnectInterval = setInterval(async () => {
            logger.info('Attempting to reconnect to MySQL...');
            await tryConnect();
        }, 10000);
    }
}
