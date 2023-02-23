INSERT INTO activity_entry 
  (id, 
  title, 
  activity_id, 
  emission_factor_id, 
  uncertainty, 
  result_tco2, 
  compute_method_type, 
  compute_method_id,
  description,
  data_source,
  owner_id,
  writer_id,
  activity_entry_reference_id,
  custom_emission_factor_id,
  custom_emission_factor_value
  )
VALUES
  (1, "activity-entry-1", 1, 1, 0, 0, "STANDARD", 1, "activity-entry-1-description", "activity-entry-1-data-source", 9, 10, 1, null, null)
