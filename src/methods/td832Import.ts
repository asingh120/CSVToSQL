import fs from 'fs';
import csv from 'csv-parser';
import replace = require('stream-replace');
import config from '../config/config';
import { sqlInsertFactory } from '../utils';
import getPool from '../datasource/pg';

const uploadAndInsertByBatch = () => {
  return new Promise((resolve, reject) => {
    const sqlBatcher = sqlInsertFactory(
      35,
      100,
      async (rowBatch, identifiers) => {
        const pool = getPool();
        const insertString = `INSERT INTO "td832" (
          recedi
          ,grp
          ,cat
          ,sub
          ,vend_code
          ,manu_part
          ,part_num
          ,descr
          ,cost
          ,retail
          ,qty
          ,unit_of_meas
          ,list_price
          ,eff_date
          ,tech_fax
          ,status
          ,upc
          ,promoprice
          ,catalog_num
          ,purpose_cat
          ,main_type
          ,prod_desc_prod
          ,ser_num
          ,lead_time
          ,eff_date_lead
          ,alt_price
          ,promo_eff_date
          ,ctb02_desc
          ,ctb03_qty_qa
          ,ctb04_qty
          ,ctb05_amt_code
          ,ctb06_amt
          ,deal_number
          ,deal_descr
          ,msr_price
        )
        VALUES ${rowBatch.join(',\n')}
        ON CONFLICT DO NOTHING`;
        await pool.query(insertString, identifiers);
      }
    );

    const readable = fs
      .createReadStream(config.td832.filePath)
      .pipe(replace(/\"/g, ''))
      .pipe(replace(/\'/g, ''))
      .pipe(replace(/\//g, ''))
      .pipe(replace(/\\/g, ''))
      .pipe(replace(/\,/g, ''))
      .pipe(replace(/\./g, ''))
      .pipe(replace(/\$/g, ''))
      .pipe(replace(/\#/g, ''))
      .pipe(csv({ separator: '\t' }));

    readable.on('data', async (row) => {
      readable.pause();
      await sqlBatcher(row);
      readable.resume();
    });

    readable.on('end', async () => {
      await sqlBatcher({}, true);
      resolve();
    });
  });
};

export default uploadAndInsertByBatch;
