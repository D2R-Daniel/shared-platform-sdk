package com.platform.sdk.webhooks;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Available webhook event types.
 */
public enum WebhookEvent {
    // User events
    USER_CREATED("user.created"),
    USER_UPDATED("user.updated"),
    USER_DELETED("user.deleted"),
    USER_ACTIVATED("user.activated"),
    USER_DEACTIVATED("user.deactivated"),
    // Team events
    TEAM_CREATED("team.created"),
    TEAM_UPDATED("team.updated"),
    TEAM_DELETED("team.deleted"),
    TEAM_MEMBER_ADDED("team.member_added"),
    TEAM_MEMBER_REMOVED("team.member_removed"),
    TEAM_MEMBER_ROLE_CHANGED("team.member_role_changed"),
    // Invitation events
    INVITATION_CREATED("invitation.created"),
    INVITATION_SENT("invitation.sent"),
    INVITATION_ACCEPTED("invitation.accepted"),
    INVITATION_EXPIRED("invitation.expired"),
    INVITATION_REVOKED("invitation.revoked"),
    // Role events
    ROLE_CREATED("role.created"),
    ROLE_UPDATED("role.updated"),
    ROLE_DELETED("role.deleted"),
    ROLE_ASSIGNED("role.assigned"),
    ROLE_REMOVED("role.removed"),
    // Session events
    SESSION_CREATED("session.created"),
    SESSION_EXPIRED("session.expired"),
    // Settings events
    SETTINGS_UPDATED("settings.updated");

    private final String value;

    WebhookEvent(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
