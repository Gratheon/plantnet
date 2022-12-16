// global dependencies

// local dependencies
import plantModel from './models/plants.js';

export const resolvers = {
	Query: {
		plants: async (_, args) => {
			const data = await plantModel.getPlants(args.lat, args.lng);
			return data;
		}
	},

	Plant: {
		images: async (parent) => {
			const data = await plantModel.getPlantImages(parent.gbifID);
			return data;
		}
	}
}
