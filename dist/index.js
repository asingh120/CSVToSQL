"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    database: 'postgres',
    host: 'localhost',
    password: 'test123',
    port: 5432,
    user: 'admin',
});
const myQuery = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const firstQueryResults = yield pool.query('SELECT * FRO test_table');
        console.log(firstQueryResults.rows);
        const secondQueryResults = yield pool.query('SELECT now()');
        console.log(secondQueryResults.rows);
        pool.end();
    }
    catch (e) {
        if (e instanceof Error) {
            console.error(e.stack);
        }
    }
});
myQuery();
// fs.readFile(
//   'C:\\Users\\Rishabh\\catalog-builder\\src\\TD832.txt',
//   { encoding: 'utf-8' },
//   (err, data) => {
//     if (err) {
//       return console.error(err);
//     }
//     console.log(data);
//   }
// );
//# sourceMappingURL=index.js.map