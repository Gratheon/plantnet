"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../storage");
const mysql_1 = require("@databases/mysql");
exports.default = {
    getPlants: async function (lat, lng) {
        const km = 5;
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        const results = await (0, storage_1.storage)().query((0, mysql_1.sql) `
            SELECT gbifID, \`references\` as URL, scientificName, 
                   st_distance_sphere(point(${latNum}, ${lngNum}), coord) as distance
            FROM occurence FORCE INDEX(coord) 
            WHERE st_contains(st_makeEnvelope (
                point((${latNum} + ${km}/111), (${lngNum} + ${km}/111)),
                point((${latNum} - ${km}/111), (${lngNum} - ${km}/111))
            ), coord)
            LIMIT 10
        `);
        return results;
    },
    getPlantImages: async function (gbifID) {
        const results = await (0, storage_1.storage)().query((0, mysql_1.sql) `
            SELECT identifier as URL, title, source, created, creator
            FROM multimedia
            WHERE gbifID=${gbifID}
            LIMIT 3
        `);
        return results;
    },
};
//# sourceMappingURL=plants.js.map