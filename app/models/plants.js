import { storage } from "../storage.js";

export default {
	getPlants: async function (lat, lng) {
		let km = 5
		const result = await storage().query(
			`SELECT gbifID, \`references\` as URL, scientificName, st_distance_sphere(point(?, ?), coord) as distance
			FROM occurence FORCE INDEX(coord) 
			WHERE st_contains(st_makeEnvelope (
				point((? + ?/111), (? + ?/111)),
				point((? - ?/111), (? - ?/111))
			), coord)
			LIMIT 10`,
			[
				lat, lng,
				lat, km, lng, km,
				lat, km, lng, km,
			]
		);

		return result[0];
	},
	getPlantImages: async function (gbifID) {
		const result = await storage().query(
			`SELECT identifier as URL, title, source, created, creator
			FROM multimedia
			WHERE gbifID=?
			LIMIT 3`,
			[
				gbifID
			]
		);

		return result[0];
	},
}
