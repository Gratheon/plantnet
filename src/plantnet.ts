import "./sentry";
import { ApolloServer } from "apollo-server-fastify";
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import fastify, { FastifyInstance } from "fastify";
import { buildSubgraphSchema } from '@apollo/federation';
import { logger } from './logger';
import { schema } from './schema';
import { resolvers } from './resolvers';
import { initStorage, isStorageConnected } from "./storage";
import { registerSchema } from "./schema-registry";
import { rootHandler } from "./rootHandler";
import { Sentry } from "./sentry";

// Enable source maps in development
if (process.env.ENV_ID === 'dev') {
    try {
        require('source-map-support').install({
            handleUncaughtExceptions: false,
            environment: 'node',
            hookRequire: true,
        });
    } catch (e) {
        logger.error('Failed to enable source-map-support', { error: e });
    }
}

function fastifyAppClosePlugin(app: FastifyInstance) {
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

async function startApolloServer(app: FastifyInstance, typeDefs: any, resolvers: any): Promise<string> {
    const server = new ApolloServer({
        typeDefs: buildSubgraphSchema(typeDefs),
        resolvers,
        plugins: [
            fastifyAppClosePlugin(app),
            ApolloServerPluginLandingPageGraphQLPlayground(),
            ApolloServerPluginDrainHttpServer({ httpServer: app.server })
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
        logger.info('Initializing storage...');
        await initStorage();

        const app = fastify();
        
        app.get('/', rootHandler);
        app.get('/health', async (request, reply) => {
            reply.send({ 
                status: 'ok',
                mysql: isStorageConnected() ? 'connected' : 'disconnected'
            });
        });
        
        // Global error handler
        app.setErrorHandler(async (error, request, reply) => {
            logger.error(error);
            
            if (Sentry) {
                Sentry.withScope(function (scope) {
                    Sentry.captureException(error);
                });
            }
            
            reply.status(500).send({ error: "Something went wrong" });
        });

        await registerSchema(schema);
        logger.info('Starting Apollo server...');
        const path = await startApolloServer(app, schema, resolvers);

        await app.listen({ port: 8090, host: '0.0.0.0' });
        logger.info(`Server ready at http://localhost:8090${path}`);
    } catch (e) {
        logger.error(e as Error);
        process.exit(1);
    }
})();
