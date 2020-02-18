import { Pool } from 'pg';
import config from '../config/config';

const poolFactory = () => {
  let pool: Pool;
  return () => {
    if (!pool) {
      pool = new Pool(config.database);
    }
    return pool;
  };
};

const getPool = poolFactory();

export default getPool;
