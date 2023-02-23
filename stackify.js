const config = require("config");

/**
 * Stackify Node APM Configuration
 */
 exports.config = {
  /**
   * Your application name.
   */
  application_name: config.prefixMonitoring.appName,
  /**
   * Your environment name.
   */
  environment_name: process.env.NODE_ENV ?? 'local',
  /**
   * Enable Prefix.
   */
   prefix_enabled: config.prefixMonitoring.enabled
}