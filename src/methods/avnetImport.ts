import fs from 'fs';
import csv from 'csv-parser';
import config from '../config/config';
import { sqlInsertFactory } from '../utils';
import getPool from '../datasource/pg';

const uploadAndInsertByBatch = () => {
  return new Promise<void>((resolve, reject) => {
    const sqlBatcher = sqlInsertFactory(
      20,
      100,
      async (rowBatch, identifiers) => {
        const pool = getPool();
        await pool.query(
          `
          INSERT INTO "internCSV" (
            vendor_code
            ,manufacturer_name
            ,mfg_part_number
            ,part_description
            ,length_
            ,height_
            ,width_depth
            ,gross_weight
            ,net_weight
            ,weight_uom
            ,upc_code
            ,available_qty
            ,uom
            ,customer_price
            ,unit_list_price
            ,currency_type
            ,effective_date
            ,material_sales_status
            ,uncosted
            ,material_group
            ,mat_group_desc
          )
          VALUES ${rowBatch.join(',')}
          ON CONFLICT DO NOTHING
        `,
          identifiers
        );
      }
    );
    // Creating a read stream object through 'fs' and reading our CSV file
    const readable = fs
      .createReadStream(config.avnet.filePath)
      .pipe(csv({ separator: ',' }));

    readable.on('data', async (row) => {
      readable.pause();
      await sqlBatcher(row);
      readable.resume();
    });
    // creates final batch of any rows leftover if number of rows is not divisible by 100
    readable.on('end', async () => {
      await sqlBatcher(null, true);
      resolve();
    });
  });
};
export default uploadAndInsertByBatch;
