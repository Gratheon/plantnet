import { gql } from "apollo-server-core";

export const schema = gql`
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
