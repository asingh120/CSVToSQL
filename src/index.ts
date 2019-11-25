import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

// Creating an object as an entry point to the data base
const pool = new Pool({
  database: 'postgres',
  host: 'localhost',
  password: 'test123',
  port: 5432,
  user: 'admin',
});

// Using path.join to create an object linking to our source folder
const filePath = path.join('c:', 'users', 'rishabh', 'catalog-builder', 'src');

// Main method??
const main = async () => {
  let rowBatch = [];
  let identifier = [];
  // Counter
  let base = 0;
  // Boolean variable used later on to exclude first line in csv file(headers in source file)
  let first = true;
  let rowCounter = 0;
  try {
    // Creating a read stream object through 'fs' and reading our CSV file
    const readable = fs.createReadStream(
      path.join(filePath, '0009000395_TS_ALL_112019.csv')
    );
    // Creating a pipe to connect readstream to postgress
    readable.pipe(csv()).on('data', async (row) => {
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
      identifier = identifier.concat(
        Object.values(row)
          .slice(0, -1)
          .map((item) => (item === '' ? null : item))
      );
      if (rowBatch.length === 100) {
        readable.pause();
        console.log(identifier.length);
        await pool.query(
          `INSERT INTO "internCSV" (
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
            ON CONFLICT DO NOTHING`,
          identifier
        );
        base = 0;
        identifier = [];
        rowBatch = [];
        readable.resume();
      }
    });
    readable.on('end', async () => {
      if (rowBatch.length > 0) {
        console.log(identifier.length);
        await pool.query(
          `INSERT INTO "internCSV" (
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
          ON CONFLICT DO NOTHING`,
          identifier
        );
      }
      console.log(rowCounter);
    });
  } catch (e) {
    console.error(e.stack);
  }
};

main();
