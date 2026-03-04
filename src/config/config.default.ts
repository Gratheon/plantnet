import { Config } from "./types";

const config: Config = {
    schemaRegistryHost: process.env.SCHEMA_REGISTRY_HOST || "http://gql-schema-registry:3000",
    selfUrl: process.env.SELF_URL || "plantnet:8090",
    sentryDsn: process.env.SENTRY_DSN || "",
    JWT_KEY: process.env.JWT_KEY || "",
    mysql: {
        host: process.env.MYSQL_HOST || "mysql",
        port: process.env.MYSQL_PORT || "3306",
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "test",
        database: process.env.MYSQL_DATABASE || "plantnet",
    },
};

export default config;
