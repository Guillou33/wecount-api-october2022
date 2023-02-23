export enum ComputeMethodType {
  STANDARD = "STANDARD",
  // Old way to have a custom emission factor. Only allows to add a unit number, and a TCO2 value. Still works, but disabled in frontend for new entries.
  DEPRECATE_EMISSION_FACTOR = "EMISSION_FACTOR",
  CUSTOM_EMISSION_FACTOR = "CUSTOM_EMISSION_FACTOR",
  RAW_DATA = "RAW_DATA",
};
