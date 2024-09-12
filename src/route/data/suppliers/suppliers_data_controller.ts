/**
 * Parse supplier's data.
 * @param {any} position position of sheet value.
 * @param {any} values values of sheet value.
 * @return {any} data parsed.
 */
export function parseSupplierRow(
  position: number,
  values: any[]
): any {
  let rutFileUrl= "";

  if (values[10] != undefined) {
    rutFileUrl = values[10];
  }
  const data = {
    position: position,
    id: values[0],
    firstName: values[1],
    lastName: values[2],
    documentType: values[3],
    document: values[4],
    phone: values[5],
    email: values[6],
    bankType: values[7],
    accountType: values[8],
    accountNumber: values[9],
    rutFileUrl: rutFileUrl
  };

  return data;
}
