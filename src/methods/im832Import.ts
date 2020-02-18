import fs from 'fs';
import csv from 'csv-parser';
import replace = require('stream-replace');
import config from '../config/config';
import { sqlInsertFactory } from '../utils';
import getPool from '../datasource/pg';

const uploadAndInsertByBatch = () => {
  return new Promise((resolve, reject) => {
    const sqlBatcher = sqlInsertFactory(
      13,
      100,
      async (rowBatch, identifiers) => {
        const pool = getPool();
        await pool.query(
          `
          INSERT INTO "IM832" (
              name
              ,description
              ,is_active
              ,family
              ,extmfrid__c
              ,current_product_cost__c
              ,manufacturer__c
              ,dist_part_number__c
              ,catalog_source__c
              ,serialized__c
              ,unspsc_code__c
              ,upc_code__c
              ,list_price__c
              )
              VALUES ${rowBatch.join(',')}
              ON CONFLICT DO NOTHING`,
          identifiers
        );
      }
    );

    // Creating a read stream object through 'fs' and reading our CSV file
    const readable = fs
      .createReadStream(config.im832.filePath)
      .pipe(replace(/\"/g, ''))
      .pipe(csv({ separator: '\t' }));
    // Creating a pipe to connect readstream to postgress

    readable.on('data', async (row) => {
      // (removes headers for each row after initial row with of headers)
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
