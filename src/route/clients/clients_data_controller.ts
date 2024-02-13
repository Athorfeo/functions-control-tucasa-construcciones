/**
 * Parse client's data.
 * @param {any} position position of sheet value.
 * @param {any} values values of sheet value.
 * @return {any} data parsed.
 */
export function parseClientRow(
  position: number,
  values: any[]
): any {
  let rutFileUrl= "";
  let documentFileUrl = "";

  if (values[6] != undefined) {
    rutFileUrl = values[6];
  }

  if (values[7] != undefined) {
    documentFileUrl = values[7];
  }

  const data = {
    position: position,
    id: values[0],
    createdDate: values[1],
    document: values[2],
    name: values[3],
    address: values[4],
    email: values[5],
    rutFileUrl: rutFileUrl,
    documentFileUrl: documentFileUrl,
  };

  return data;
}

/**
 * Parse Households's row.
 * @param {any} position position of sheet value.
 * @param {any} values values of sheet value.
 * @return {any} data parsed.
 */
export function parseHouseholdsRow(
  position: number,
  values: any[]
): any {
  let promiseFileUrl= "";
  if (values[7] != undefined) {
    promiseFileUrl = values[7];
  }
  
  let invoiceFileUrl= "";
  if (values[8] != undefined) {
    invoiceFileUrl = values[8];
  }

  let certificateFileUrl= "";
  if (values[9] != undefined) {
    certificateFileUrl = values[9];
  }

  const row = {
    position: position,
    id: values[0],
    createdDate: values[1],
    document: values[2],
    numberHousehold: values[3],
    value: values[4],
    initialFee: values[5],
    Balance: values[6],
    promiseFileUrl: promiseFileUrl,
    invoiceFileUrl: invoiceFileUrl,
    certificateFileUrl: certificateFileUrl
  };

  return row;
}

/**
 * Parse payments row.
 * @param {any} position position of sheet value.
 * @param {any} values values of sheet value.
 * @return {any} data parsed.
 */
export function parsePaymentsRow(
  position: number,
  values: any[]
): any {
  let supportFileUrl= "";
  if (values[8] != undefined) {
    supportFileUrl = values[8];
  }

  const row = {
    position: position,
    id: values[0],
    createdDate: values[1],
    paymentDate: values[2],
    document: values[3],
    value: values[4],
    paymentType: values[5],
    detail: values[6],
    observations: values[7],
    supportFileUrl: supportFileUrl,
    accountingDocument: values[9],
  };

  return row;
}
