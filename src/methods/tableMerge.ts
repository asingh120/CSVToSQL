import getPool from '../datasource/pg';

//import { Pool } from pg;

const merge = async () => {
  const pool = getPool();
  await pool.query(`
    INSERT INTO "catalog"(
      Id
      Description,
      Cost,
      Promotional,
      Retail_Price,
      MFR_Name,
      MFR_Part_Num,
      UPC,
      Vendor_ID,
      Vendor_Name,
      Vendor_Part_Num,
      Class,
      Category,
      Sub_Category,
      Availability,
      Special_ID,
      distributor,
      UNSPSC
            )
        SELECT *
        FROM (
          SELECT
                  part_description,
                  unit_list_price,
                  NULL,
                  customer_price,
                  manufacturer_name,
                  mfg_part_number,
                  upc_code,
                  NULL,
                  NULL,
                  NULL,
                  NULL,
                  NULL,
                  NULL,
                  available_qty,
                  NULL,
                  'Avnet',
				  NULL
            FROM "internCSV"
            UNION ALL
            SELECT
              descr,
              cost,
              promoprice,
              retail,
              manu_part,
              part_num,
              upc,
              vend_code,
              NULL,
              part_num,
              NULL,
              cat,
              sub,
              Null,
              Null,
              'TD832',
			        NULL
            FROM "td832"
            UNION ALL
              SELECT
                part_description,
                contract_price,
                discount_category,
                msrp,
                manufacturer,
                manufacturer_part_number,
                NULL,
                sender_id,
                brand,
                vendor_part_number,
                NULL,
                item_category_name,
                item_category_id,
                NULL,
                Null,
                'arrow',
                NULL
                FROM "arrow"
            UNION ALL
              SELECT
			  	description,
                current_product_cost__c,
                NULL,
                list_price__c,
                manufacturer__c,
                dist_part_number__c,
                upc_code__c,
                name,
                NULL,
                NULL,
                NULL,
                NULL,
                NULL,
                NULL,
                NULL,
                'IM832',
                unspsc_code__c
              FROM "IM832"
            ) AS "unusedAlias"
  `);
};

export default merge;
