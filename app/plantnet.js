"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./sentry");
const apollo_server_fastify_1 = require("apollo-server-fastify");
const apollo_server_core_1 = require("apollo-server-core");
const fastify_1 = __importDefault(require("fastify"));
const federation_1 = require("@apollo/federation");
const logger_1 = require("./logger");
const schema_1 = require("./schema");
const resolvers_1 = require("./resolvers");
const storage_1 = require("./storage");
const schema_registry_1 = require("./schema-registry");
const rootHandler_1 = require("./rootHandler");
const sentry_1 = require("./sentry");
if (process.env.ENV_ID === 'dev') {
    try {
        require('source-map-support').install({
            handleUncaughtExceptions: false,
            environment: 'node',
            hookRequire: true,
        });
    }
    catch (e) {
        logger_1.logger.error('Failed to enable source-map-support', { error: e });
    }
}
function fastifyAppClosePlugin(app) {
    return {
        async serverWillStart() {
            return {
                async drainServer() {
                    await app.close();
                }
            };
        }
    };
}
async function startApolloServer(app, typeDefs, resolvers) {
    const server = new apollo_server_fastify_1.ApolloServer({
        typeDefs: (0, federation_1.buildSubgraphSchema)(typeDefs),
        resolvers,
        plugins: [
            fastifyAppClosePlugin(app),
            (0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)(),
            (0, apollo_server_core_1.ApolloServerPluginDrainHttpServer)({ httpServer: app.server })
        ],
        context: (req) => {
            return {
                uid: req.request.raw.headers['internal-userid']
            };
        },
    });
    await server.start();
    app.register(server.createHandler());
    return server.graphqlPath;
}
(async function main() {
    try {
        logger_1.logger.info('Initializing storage...');
        await (0, storage_1.initStorage)();
        const app = (0, fastify_1.default)();
        app.get('/', rootHandler_1.rootHandler);
        app.get('/health', async (request, reply) => {
            reply.send({
                status: 'ok',
                mysql: (0, storage_1.isStorageConnected)() ? 'connected' : 'disconnected'
            });
        });
        app.setErrorHandler(async (error, request, reply) => {
            logger_1.logger.error(error);
            if (sentry_1.Sentry) {
                sentry_1.Sentry.withScope(function (scope) {
                    sentry_1.Sentry.captureException(error);
                });
            }
            reply.status(500).send({ error: "Something went wrong" });
        });
        await (0, schema_registry_1.registerSchema)(schema_1.schema);
        logger_1.logger.info('Starting Apollo server...');
        const path = await startApolloServer(app, schema_1.schema, resolvers_1.resolvers);
        await app.listen({ port: 8090, host: '0.0.0.0' });
        logger_1.logger.info(`Server ready at http://localhost:8090${path}`);
    }
    catch (e) {
        logger_1.logger.error(e);
        process.exit(1);
    }
})();
//# sourceMappingURL=plantnet.js.map