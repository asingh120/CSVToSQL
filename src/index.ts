import {
  arrowTableCreation,
  avnetTableCreation,
  im832TableCreation,
  td832TableCreation,
  tableMerge,
} from './methods';

const main = async () => {
  try {
    await arrowTableCreation();
    await avnetTableCreation();
    await im832TableCreation();
    await td832TableCreation();
    await tableMerge();
    console.log('Finished');
  } catch (e) {
    console.error(e);
  }
};

main();
