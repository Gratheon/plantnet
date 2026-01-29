import createConnectionPool, { sql, ConnectionPool } from '@databases/mysql';
import stringify from 'fast-safe-stringify';
import config from '../config';

type LogLevel = 'info' | 'error' | 'warn' | 'debug';

interface LogMeta {
    [key: string]: any;
}

let logsDb: ConnectionPool | null = null;
let isDbConnected = false;

// Initialize logs database connection
async function initLogsDb() {
    try {
        const baseDsn = `mysql://${config.mysql.user}:${config.mysql.password}@${config.mysql.host}:${config.mysql.port}`;
        const poolOptions = `?connectionLimit=3&waitForConnections=true&connectTimeout=10000`;
        
        logsDb = createConnectionPool({
            connectionString: `${baseDsn}/logs${poolOptions}`,
            bigIntMode: 'number',
            poolSize: 3,
            maxUses: 100,
            idleTimeoutMilliseconds: 30_000,
            queueTimeoutMilliseconds: 60_000,
            onError: (err) => {
                if (!err.message?.includes('packets out of order')) {
                    console.error('Logs DB connection pool error:', err.message);
                    isDbConnected = false;
                    
                    // Try to reconnect after 10 seconds
                    if (err.message?.includes('disconnected by the server') || 
                        err.message?.includes('Connection lost')) {
                        setTimeout(() => initLogsDb(), 10000);
                    }
                }
            },
        });
        
        // Create logs table if it doesn't exist
        await logsDb.query(sql`CREATE TABLE IF NOT EXISTS logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            level VARCHAR(16) NOT NULL,
            message VARCHAR(2048) NOT NULL,
            meta VARCHAR(2048) NOT NULL,
            timestamp DATETIME NOT NULL
        );`);
        
        isDbConnected = true;
    } catch (err) {
        console.error('Failed to connect to logs database:', err);
        isDbConnected = false;
        
        // Retry after 10 seconds
        setTimeout(() => initLogsDb(), 10000);
    }
}

// Initialize on module load
initLogsDb().catch(() => {});

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    gray: '\x1b[90m',
    magenta: '\x1b[35m',
};

function formatTimestamp(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${colors.blue}${hours}:${minutes}:${seconds}${colors.reset}`;
}

function getColorForLevel(level: LogLevel): string {
    switch (level) {
        case 'error': return colors.red;
        case 'info': return colors.green;
        case 'warn': return colors.yellow;
        case 'debug': return colors.gray;
        default: return colors.reset;
    }
}

function logToConsole(level: LogLevel, message: string, meta?: LogMeta): void {
    const timestamp = formatTimestamp();
    const levelColor = getColorForLevel(level);
    const levelStr = `${levelColor}[${level.toUpperCase()}]${colors.reset}`;
    
    let logMessage = `${timestamp} ${levelStr} ${message}`;
    
    if (meta && Object.keys(meta).length > 0) {
        logMessage += ` ${colors.magenta}${stringify(meta)}${colors.reset}`;
    }
    
    console.log(logMessage);
}

async function logToDatabase(level: LogLevel, message: string, meta?: LogMeta): Promise<void> {
    if (!logsDb || !isDbConnected) {
        return;
    }
    
    try {
        const metaStr = meta ? stringify(meta) : '';
        const timestamp = new Date();
        
        await logsDb.query(sql`
            INSERT INTO logs (level, message, meta, timestamp) 
            VALUES (${level}, ${message}, ${metaStr}, ${timestamp})
        `);
    } catch (err) {
        // Don't crash the app if logging fails
        console.error('Failed to log to database:', err);
    }
}

function formatErrorMessage(error: Error | string): string {
    if (typeof error === 'string') {
        return error;
    }
    
    let message = error.message || 'Unknown error';
    
    if (error.stack && process.env.ENV_ID === 'dev') {
        message += `\n${colors.gray}${error.stack}${colors.reset}`;
    }
    
    return message;
}

export const logger = {
    info: (message: string, meta?: LogMeta) => {
        logToConsole('info', message, meta);
        logToDatabase('info', message, meta).catch(() => {});
    },
    
    error: (error: Error | string, meta?: LogMeta) => {
        const message = formatErrorMessage(error);
        logToConsole('error', message, meta);
        logToDatabase('error', message, meta).catch(() => {});
    },
    
    errorEnriched: (contextMessage: string, error: Error, meta?: LogMeta) => {
        const errorMessage = formatErrorMessage(error);
        const fullMessage = `${contextMessage}: ${errorMessage}`;
        logToConsole('error', fullMessage, meta);
        logToDatabase('error', fullMessage, meta).catch(() => {});
    },
    
    warn: (message: string, meta?: LogMeta) => {
        logToConsole('warn', message, meta);
        logToDatabase('warn', message, meta).catch(() => {});
    },
    
    debug: (message: string, meta?: LogMeta) => {
        // Debug logs only to console, not database
        logToConsole('debug', message, meta);
    },
};

// Global error handlers
process.on('uncaughtException', (error: Error) => {
    logger.errorEnriched('Uncaught exception', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled promise rejection', { reason });
    process.exit(1);
});
