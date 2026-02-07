/**
 * Settings service errors.
 */

export class SettingsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SettingsError';
  }
}

export class SettingNotFoundError extends SettingsError {
  public readonly key: string;

  constructor(key: string) {
    super(`Setting not found: ${key}`);
    this.name = 'SettingNotFoundError';
    this.key = key;
  }
}

export class InvalidSettingValueError extends SettingsError {
  public readonly key: string;

  constructor(key: string, message: string) {
    super(`Invalid value for setting '${key}': ${message}`);
    this.name = 'InvalidSettingValueError';
    this.key = key;
  }
}

export class InvalidCategoryError extends SettingsError {
  public readonly category: string;

  constructor(category: string) {
    super(`Invalid settings category: ${category}`);
    this.name = 'InvalidCategoryError';
    this.category = category;
  }
}

export class SettingLockedError extends SettingsError {
  public readonly key: string;
  public readonly lockedBy?: string;

  constructor(key: string, lockedBy?: string) {
    const msg = lockedBy
      ? `Setting '${key}' is locked by ${lockedBy}`
      : `Setting '${key}' is locked`;
    super(msg);
    this.name = 'SettingLockedError';
    this.key = key;
    this.lockedBy = lockedBy;
  }
}

export class ReadonlySettingError extends SettingsError {
  public readonly key: string;

  constructor(key: string) {
    super(`Setting '${key}' is readonly and cannot be modified`);
    this.name = 'ReadonlySettingError';
    this.key = key;
  }
}

export class ImportValidationError extends SettingsError {
  public readonly errors: Array<{ key: string; reason: string }>;

  constructor(errors: Array<{ key: string; reason: string }>) {
    super(`Import validation failed with ${errors.length} error(s)`);
    this.name = 'ImportValidationError';
    this.errors = errors;
  }
}

export class InvalidEnvironmentError extends SettingsError {
  public readonly environment: string;

  constructor(environment: string) {
    super(`Invalid environment: ${environment}`);
    this.name = 'InvalidEnvironmentError';
    this.environment = environment;
  }
}
