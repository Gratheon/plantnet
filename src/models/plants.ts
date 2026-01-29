import { storage } from "../storage";
import { sql } from '@databases/mysql';

export interface Plant {
    gbifID: string;
    URL: string;
    scientificName: string;
    distance: number;
}

export interface PlantImage {
    URL: string;
    title: string;
    source: string;
    created: Date;
    creator: string;
}

export default {
    getPlants: async function (lat: string, lng: string): Promise<Plant[]> {
        const km = 5;
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        
        const results = await storage().query(sql`
            SELECT gbifID, \`references\` as URL, scientificName, 
                   st_distance_sphere(point(${latNum}, ${lngNum}), coord) as distance
            FROM occurence FORCE INDEX(coord) 
            WHERE st_contains(st_makeEnvelope (
                point((${latNum} + ${km}/111), (${lngNum} + ${km}/111)),
                point((${latNum} - ${km}/111), (${lngNum} - ${km}/111))
            ), coord)
            LIMIT 10
        `);

        return results as Plant[];
    },
    
    getPlantImages: async function (gbifID: string): Promise<PlantImage[]> {
        const results = await storage().query(sql`
            SELECT identifier as URL, title, source, created, creator
            FROM multimedia
            WHERE gbifID=${gbifID}
            LIMIT 3
        `);

        return results as PlantImage[];
    },
}
