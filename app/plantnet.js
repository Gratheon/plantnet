import { ApolloServer } from "apollo-server-fastify";
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import fastify from "fastify";
import { buildSubgraphSchema } from '@apollo/federation';

import { schema } from './schema.js';
import { resolvers } from './resolvers.js';
import { initStorage } from "./storage.js";
import { registerSchema } from "./schema-registry.js";

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
	initStorage();

	const app = fastify();
	app.get('/health', (request, reply) => {
		reply.send({ hello: 'world' })
	})

	try {
		await registerSchema(schema);
		console.log('Starting apollo server');
		const path = await startApolloServer(app, schema, resolvers);

		await app.listen(8090, '0.0.0.0');
		console.log(`🚀 Server ready at http://localhost:8090${path}`);
	} catch (e) {
		console.error(e);
	}
})();
