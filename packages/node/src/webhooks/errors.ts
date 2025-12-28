/**
 * Webhooks service errors.
 */

export class WebhookError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookError';
  }
}

export class WebhookNotFoundError extends WebhookError {
  public readonly webhookId: string;

  constructor(webhookId: string) {
    super(`Webhook not found: ${webhookId}`);
    this.name = 'WebhookNotFoundError';
    this.webhookId = webhookId;
  }
}

export class DeliveryNotFoundError extends WebhookError {
  public readonly deliveryId: string;

  constructor(deliveryId: string) {
    super(`Webhook delivery not found: ${deliveryId}`);
    this.name = 'DeliveryNotFoundError';
    this.deliveryId = deliveryId;
  }
}

export class DeliveryFailedError extends WebhookError {
  public readonly webhookId: string;

  constructor(webhookId: string, message: string) {
    super(`Webhook delivery failed for ${webhookId}: ${message}`);
    this.name = 'DeliveryFailedError';
    this.webhookId = webhookId;
  }
}

export class InvalidSignatureError extends WebhookError {
  constructor(message: string = 'Invalid webhook signature') {
    super(message);
    this.name = 'InvalidSignatureError';
  }
}
