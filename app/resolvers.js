"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const plants_1 = __importDefault(require("./models/plants"));
exports.resolvers = {
    Query: {
        plants: async (_, args) => {
            const data = await plants_1.default.getPlants(args.lat, args.lng);
            return data;
        }
    },
    Plant: {
        images: async (parent) => {
            const data = await plants_1.default.getPlantImages(parent.gbifID);
            return data;
        }
    }
};
//# sourceMappingURL=resolvers.js.map