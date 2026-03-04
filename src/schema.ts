import { parse } from "graphql";

export const schema = parse(/* GraphQL */ `
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
`);
