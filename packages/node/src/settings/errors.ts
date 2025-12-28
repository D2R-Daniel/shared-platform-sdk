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
