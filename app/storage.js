import config from '../config/config.js';
import mysql from 'mysql2/promise';

let promisePool;
export function storage(){ return promisePool }

export function initStorage() {
	promisePool = mysql.createPool({
		...config.mysql,
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0
	});
}
