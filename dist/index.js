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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
// Creating an object as an entry point to the data base
const pool = new pg_1.Pool({
    database: 'postgres',
    host: 'localhost',
    password: 'test123',
    port: 5432,
    user: 'admin',
});
// Using path.join to create an object linking to our source folder
const filePath = path_1.default.join('c:', 'users', 'rishabh', 'catalog-builder', 'src');
// Main method??
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    let rowBatch = [];
    let identifier = [];
    // Counter
    let base = 0;
    // Boolean variable used later on to exclude first line in csv file(headers in source file)
    let first = true;
    let rowCounter = 0;
    try {
        // Creating a read stream object through 'fs' and reading our CSV file
        const readable = fs_1.default.createReadStream(path_1.default.join(filePath, '0009000395_TS_ALL_112019.csv'));
        // Creating a pipe to connect readstream to postgress
        readable.pipe(csv_parser_1.default()).on('data', (row) => __awaiter(void 0, void 0, void 0, function* () {
            // How does this work?
            if (first) {
                first = false;
                return;
            }
            // Opening up a string to be appended to
            let sqlString = '(';
            // Setting i to 0 and base
            for (let i = base; i < base + 21; i++) {
                sqlString += '$' + (i + 1);
                if (i !== base + 20) {
                    sqlString += ',';
                }
            }
            sqlString += ')';
            // Pushing sql string to array rowBatch
            rowBatch.push(sqlString);
            // adding 21 to base to move to next line
            base += 21;
            rowCounter += 1;
            // ??????????????????????
            identifier = identifier.concat(Object.values(row)
                .slice(0, -1)
                .map((item) => (item === '' ? null : item)));
            if (rowBatch.length === 100) {
                readable.pause();
                console.log(identifier.length);
                yield pool.query(`INSERT INTO "internCSV" (
              vendor_code,
              manufacturer_name,
              mfg_part_number,
              part_description,
              length_,
              height_,
              width_depth,
              gross_weight,
              net_weight,
              weight_uom,
              upc_code,
              available_qty,
              uom,
              customer_price,
              unit_list_price,
              currency_type,
              effective_date,
              material_sales_status,
              uncosted,
              material_group,
              mat_group_desc
            )
            VALUES ${rowBatch.join(',')}
            ON CONFLICT DO NOTHING`, identifier);
                base = 0;
                identifier = [];
                rowBatch = [];
                readable.resume();
            }
        }));
        readable.on('end', () => __awaiter(void 0, void 0, void 0, function* () {
            if (rowBatch.length > 0) {
                console.log(identifier.length);
                yield pool.query(`INSERT INTO "internCSV" (
            vendor_code,
            manufacturer_name,
            mfg_part_number,
            part_description,
            length_,
            height_,
            width_depth,
            gross_weight,
            net_weight,
            weight_uom,
            upc_code,
            available_qty,
            uom,
            customer_price,
            unit_list_price,
            currency_type,
            effective_date,
            material_sales_status,
            uncosted,
            material_group,
            mat_group_desc
          )
          VALUES ${rowBatch.join(',')}
          ON CONFLICT DO NOTHING`, identifier);
            }
            console.log(rowCounter);
        }));
    }
    catch (e) {
        console.error(e.stack);
    }
});
main();
//# sourceMappingURL=index.js.map