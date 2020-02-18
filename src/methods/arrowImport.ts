import fs from 'fs';
import config from '../config/config';
import { sqlInsertFactory } from '../utils';
import csvParser from 'csv-parser';
import getPool from '../datasource/pg';

const uploadAndInsertByBatch = () => {
  return new Promise((resolve, reject) => {
    // Set up batch function for arrow file
    const sqlBatcher = sqlInsertFactory(
      12,
      100,
      async (rowBatch, identifiers) => {
        const pool = getPool();
        await pool.query(
          `INSERT INTO "arrow" (
            sender_id
            ,vendor_part_number
            ,manufacturer_part_number
            ,part_description
            ,contract_price
            ,msrp
            ,manufacturer
            ,item_category_id
            ,item_category_name
            ,technology
            ,brand
            ,discount_category
            )
            VALUES ${rowBatch.join(',')}
            ON CONFLICT DO NOTHING`,
          identifiers
        );
      }
    );

    const readable = fs
      .createReadStream(config.arrow.filePath)
      .pipe(csvParser({ separator: '\t' }));

    readable.on('data', async (row) => {
      readable.pause();
      await sqlBatcher(row);
      readable.resume();
    });

    readable.on('end', async () => {
      await sqlBatcher(null, true);
      resolve();
    });
  });
};

export default uploadAndInsertByBatch;
