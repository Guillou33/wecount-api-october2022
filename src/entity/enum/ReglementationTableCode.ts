export enum ReglementationTableCode {
  ISO = "ISO",
  BEGES = "BEGES",
  GHG = "GHG",
}

export function getReglementationTableCode(
  value: string
): ReglementationTableCode {
  switch (value) {
    case ReglementationTableCode.ISO:
      return ReglementationTableCode.ISO;
    case ReglementationTableCode.BEGES:
      return ReglementationTableCode.BEGES;
    case ReglementationTableCode.GHG:
      return ReglementationTableCode.GHG;
    default:
      throw new TypeError(`'${value}' is not a valid table code`);
  }
}
