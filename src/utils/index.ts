const sqlInsertRowString = (currentTotal, columnCount) => {
  let sqlString = '(';
  // Setting i to 0 and base of 35 numbers, one for each column of 35 columns
  for (let i = currentTotal; i < currentTotal + columnCount; i++) {
    sqlString += '$' + (i + 1);
    if (i !== columnCount + currentTotal - 1) {
      sqlString += ',';
    }
  }
  sqlString += ')';
  return sqlString;
};

type SqlInsertBuilderFactory = (
  columnCount: number,
  batchSize: number,
  bulkInsertCB: (sqlStrings: string[], valuesToInsert: any[]) => Promise<void>
) => (currentRow: { [key: string]: string }, final?: boolean) => Promise<void>;

export const sqlInsertFactory: SqlInsertBuilderFactory = (
  columnCount,
  batchSize,
  bulkInsertCB
) => {
  let rowsToInsert = [];
  let identifiers = [];
  let totalCount = 0;
  let first = true;
  return async (currentRow, final = false) => {
    if (first) {
      first = false;
      return;
    }
    if (!final) {
      const sqlString = sqlInsertRowString(totalCount, columnCount);
      totalCount += columnCount;
      rowsToInsert.push(sqlString);
      identifiers = identifiers.concat(
        Object.values(currentRow).map((item) => (item === '' ? null : item))
      );
    }
    if (
      rowsToInsert.length === batchSize ||
      (final && rowsToInsert.length > 0)
    ) {
      await bulkInsertCB(rowsToInsert.slice(), identifiers.slice());
      rowsToInsert = [];
      identifiers = [];
      totalCount = 0;
    }
  };
};
