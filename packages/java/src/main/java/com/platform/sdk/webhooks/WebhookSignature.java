package com.platform.sdk.webhooks;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;

/**
 * Webhook signature utilities.
 */
public class WebhookSignature {
    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final int DEFAULT_TOLERANCE_SECONDS = 300;

    /**
     * Generate HMAC-SHA256 signature for webhook payload.
     *
     * @param payload   The raw JSON payload
     * @param secret    The webhook secret key
     * @param timestamp Unix timestamp (or null to use current time)
     * @return SignatureResult containing signature and timestamp
     */
    public static SignatureResult generateSignature(String payload, String secret, Long timestamp) {
        long ts = timestamp != null ? timestamp : Instant.now().getEpochSecond();

        String signedPayload = ts + "." + payload;
        String signature = computeHmac(signedPayload, secret);

        return new SignatureResult("sha256=" + signature, ts);
    }

    /**
     * Generate signature with current timestamp.
     */
    public static SignatureResult generateSignature(String payload, String secret) {
        return generateSignature(payload, secret, null);
    }

    /**
     * Verify HMAC-SHA256 signature for webhook payload.
     *
     * @param payload           The raw JSON payload
     * @param signature         The signature from X-Webhook-Signature header
     * @param secret            The webhook secret key
     * @param timestamp         The timestamp from X-Webhook-Timestamp header
     * @param toleranceSeconds  Maximum age of request in seconds
     * @return true if signature is valid
     * @throws InvalidSignatureException if signature is invalid or request is too old
     */
    public static boolean verifySignature(
            String payload,
            String signature,
            String secret,
            long timestamp,
            int toleranceSeconds
    ) {
        // Check timestamp tolerance
        long currentTime = Instant.now().getEpochSecond();
        if (Math.abs(currentTime - timestamp) > toleranceSeconds) {
            throw new InvalidSignatureException("Request timestamp is too old or in the future");
        }

        // Recreate the signed payload
        String signedPayload = timestamp + "." + payload;
        String expectedSignature = "sha256=" + computeHmac(signedPayload, secret);

        // Constant-time comparison to prevent timing attacks
        if (!MessageDigest.isEqual(
                signature.getBytes(StandardCharsets.UTF_8),
                expectedSignature.getBytes(StandardCharsets.UTF_8)
        )) {
            throw new InvalidSignatureException("Signature mismatch");
        }

        return true;
    }

    /**
     * Verify signature with default tolerance.
     */
    public static boolean verifySignature(String payload, String signature, String secret, long timestamp) {
        return verifySignature(payload, signature, secret, timestamp, DEFAULT_TOLERANCE_SECONDS);
    }

    /**
     * Parse the X-Webhook-Signature header value.
     */
    public static String parseSignatureHeader(String header) {
        if (header.startsWith("sha256=")) {
            return header;
        }
        return "sha256=" + header;
    }

    private static String computeHmac(String data, String secret) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8),
                    HMAC_SHA256
            );
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hmacBytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Failed to compute HMAC", e);
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    /**
     * Result of signature generation.
     */
    public static class SignatureResult {
        private final String signature;
        private final long timestamp;

        public SignatureResult(String signature, long timestamp) {
            this.signature = signature;
            this.timestamp = timestamp;
        }

        public String getSignature() { return signature; }
        public long getTimestamp() { return timestamp; }
    }
}
