import "./sentry";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import fastifyApollo, { fastifyApolloDrainPlugin } from "@as-integrations/fastify";
import fastify, { FastifyInstance } from "fastify";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { logger } from './logger';
import { schema } from './schema';
import { resolvers } from './resolvers';
import { initStorage, isStorageConnected } from "./storage";
import { registerSchema } from "./schema-registry";
import { rootHandler } from "./rootHandler";
import { Sentry } from "./sentry";

interface ApolloContext {
    uid?: string;
}

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
    const server = new ApolloServer<ApolloContext>({
        schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
        plugins: [
            fastifyAppClosePlugin(app),
            fastifyApolloDrainPlugin(app),
            ApolloServerPluginLandingPageLocalDefault({ embed: true }),
            ApolloServerPluginDrainHttpServer({ httpServer: app.server })
        ],
    });

    await server.start();
    app.register(fastifyApollo(server), {
        path: '/graphql',
        context: async (request): Promise<ApolloContext> => ({
            uid: Array.isArray(request.headers['internal-userid'])
                ? request.headers['internal-userid'][0]
                : request.headers['internal-userid']
        })
    });

    return '/graphql';
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
            logger.error(error as Error);
            
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
