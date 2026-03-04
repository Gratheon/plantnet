export interface Config {
    schemaRegistryHost: string;
    selfUrl: string;
    sentryDsn: string;
    JWT_KEY: string;
    mysql: {
        host: string;
        port: string;
        user: string;
        password: string;
        database: string;
    };
}
