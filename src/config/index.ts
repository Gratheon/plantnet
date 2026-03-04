import config from "./config.default";

function loadConfig<T>(filePath: string): T | undefined {
    try {
        return require(filePath).default;
    } catch (error) {
        return undefined;
    }
}

const env = process.env.ENV_ID || "default";
const customConfig = loadConfig<typeof config>(`./config.${env}`);
const currentConfig = { ...config, ...customConfig };

export default currentConfig;
