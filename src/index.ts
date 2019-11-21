import fs from 'fs';
import { Client, Pool } from 'pg';

const pool = new Pool({
  database: 'postgres',
  host: 'localhost',
  password: 'test123',
  port: 5432,
  user: 'admin',
});

const myQuery = async () => {
  try {
    const firstQueryResults = await pool.query('SELECT * FRO test_table');
    console.log(firstQueryResults.rows);
    const secondQueryResults = await pool.query('SELECT now()');
    console.log(secondQueryResults.rows);
    pool.end();
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.stack);
    }
  }
};

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
