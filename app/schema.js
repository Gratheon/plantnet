"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const apollo_server_core_1 = require("apollo-server-core");
exports.schema = (0, apollo_server_core_1.gql) `
    scalar JSON
    scalar DateTime
    scalar URL

		type Query{
			plants(lat: String!, lng: String!): [Plant]
		}

		type Plant {
			gbifID: ID
			URL: URL
			scientificName: String
			distance: Float
			images: [PlantImage]
		}

		type PlantImage {
			URL: URL
			title: String
			source: String
			created: DateTime
			creator: String
		}
`;
//# sourceMappingURL=schema.js.map