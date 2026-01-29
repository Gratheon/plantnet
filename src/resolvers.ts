import plantModel from './models/plants';

interface PlantArgs {
    lat: string;
    lng: string;
}

interface PlantParent {
    gbifID: string;
}

export const resolvers = {
    Query: {
        plants: async (_: unknown, args: PlantArgs) => {
            const data = await plantModel.getPlants(args.lat, args.lng);
            return data;
        }
    },

    Plant: {
        images: async (parent: PlantParent) => {
            const data = await plantModel.getPlantImages(parent.gbifID);
            return data;
        }
    }
}
