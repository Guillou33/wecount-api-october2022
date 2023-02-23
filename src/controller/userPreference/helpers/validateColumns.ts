import {ListingColumn} from "@entity/enum/ListingColumn";

function isValidColumnKey(value: any): value is ListingColumn {
  return Object.values(ListingColumn).includes(value);
}

export default function validateColumns(toValidate: any[]): ListingColumn[] {
  return toValidate.filter(isValidColumnKey);
}