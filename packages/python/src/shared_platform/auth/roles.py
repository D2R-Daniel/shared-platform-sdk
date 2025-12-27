"""
Role and permission definitions.

These match the definitions in models/auth/roles.yaml and models/auth/permissions.yaml
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Permission:
    """Permission definition."""

    id: str
    resource: str
    action: str
    name: str
    description: str = ""
    scope: str = "tenant"  # global, tenant, team, own


@dataclass
class Role:
    """Role definition with permissions."""

    id: str
    name: str
    description: str
    level: int
    permissions: list[str] = field(default_factory=list)
    inherits_from: list[str] = field(default_factory=list)
    is_system: bool = False

    def get_all_permissions(self, all_roles: dict[str, "Role"]) -> set[str]:
        """Get all permissions including inherited ones."""
        perms = set(self.permissions)
        for parent_id in self.inherits_from:
            if parent_id in all_roles:
                perms.update(all_roles[parent_id].get_all_permissions(all_roles))
        return perms


# Predefined Roles
ROLES: dict[str, Role] = {
    "super_admin": Role(
        id="super_admin",
        name="Super Administrator",
        description="Full platform access. Can manage all tenants, users, and system settings.",
        level=100,
        permissions=["*"],
        inherits_from=[],
        is_system=True,
    ),
    "admin": Role(
        id="admin",
        name="Administrator",
        description="Full tenant access. Can manage users, settings, and all resources within their tenant.",
        level=80,
        permissions=[
            "users:*",
            "roles:read",
            "roles:assign",
            "settings:*",
            "reports:*",
            "audit:read",
            "notifications:*",
        ],
        inherits_from=["manager"],
        is_system=True,
    ),
    "manager": Role(
        id="manager",
        name="Manager",
        description="Team management access. Can manage team members and view reports.",
        level=60,
        permissions=[
            "users:read",
            "users:invite",
            "team:*",
            "reports:read",
            "reports:export",
        ],
        inherits_from=["user"],
        is_system=True,
    ),
    "user": Role(
        id="user",
        name="User",
        description="Standard user access. Can access platform features and manage their own profile.",
        level=40,
        permissions=[
            "profile:*",
            "notifications:read",
            "notifications:update_preferences",
        ],
        inherits_from=["guest"],
        is_system=True,
    ),
    "guest": Role(
        id="guest",
        name="Guest",
        description="Limited access. Can view public content only.",
        level=10,
        permissions=["public:read"],
        inherits_from=[],
        is_system=True,
    ),
}


# Predefined Permissions
PERMISSIONS: dict[str, Permission] = {
    # User Management
    "users:create": Permission("users:create", "users", "create", "Create Users", "Create new user accounts"),
    "users:read": Permission("users:read", "users", "read", "View Users", "View user profiles and details"),
    "users:update": Permission("users:update", "users", "update", "Update Users", "Modify user accounts"),
    "users:delete": Permission("users:delete", "users", "delete", "Delete Users", "Remove user accounts"),
    "users:list": Permission("users:list", "users", "list", "List Users", "View user listings"),
    "users:invite": Permission("users:invite", "users", "create", "Invite Users", "Send user invitations"),
    "users:import": Permission("users:import", "users", "import", "Import Users", "Bulk import users"),
    "users:export": Permission("users:export", "users", "export", "Export Users", "Export user data"),

    # Profile Management
    "profile:read": Permission("profile:read", "profile", "read", "View Own Profile", "View own profile", scope="own"),
    "profile:update": Permission("profile:update", "profile", "update", "Update Own Profile", "Modify own profile", scope="own"),

    # Role Management
    "roles:read": Permission("roles:read", "roles", "read", "View Roles", "View role definitions"),
    "roles:create": Permission("roles:create", "roles", "create", "Create Roles", "Create custom roles"),
    "roles:update": Permission("roles:update", "roles", "update", "Update Roles", "Modify role definitions"),
    "roles:delete": Permission("roles:delete", "roles", "delete", "Delete Roles", "Remove custom roles"),
    "roles:assign": Permission("roles:assign", "roles", "assign", "Assign Roles", "Assign roles to users"),

    # Team Management
    "team:read": Permission("team:read", "team", "read", "View Team", "View team members", scope="team"),
    "team:manage": Permission("team:manage", "team", "manage", "Manage Team", "Add/remove team members", scope="team"),

    # Settings
    "settings:read": Permission("settings:read", "settings", "read", "View Settings", "View platform settings"),
    "settings:update": Permission("settings:update", "settings", "update", "Update Settings", "Modify platform settings"),

    # Reports
    "reports:read": Permission("reports:read", "reports", "read", "View Reports", "Access reports and analytics"),
    "reports:create": Permission("reports:create", "reports", "create", "Create Reports", "Generate custom reports"),
    "reports:export": Permission("reports:export", "reports", "export", "Export Reports", "Export report data"),

    # Audit
    "audit:read": Permission("audit:read", "audit", "read", "View Audit Logs", "Access audit trail"),

    # Notifications
    "notifications:read": Permission("notifications:read", "notifications", "read", "View Notifications", "View notifications", scope="own"),
    "notifications:manage": Permission("notifications:manage", "notifications", "manage", "Manage Notifications", "Configure notification settings"),
    "notifications:update_preferences": Permission("notifications:update_preferences", "notifications", "update", "Update Notification Preferences", "Update personal preferences", scope="own"),

    # Public
    "public:read": Permission("public:read", "public", "read", "View Public Content", "Access public content", scope="global"),
}


def get_role(role_id: str) -> Optional[Role]:
    """Get a role by ID."""
    return ROLES.get(role_id)


def get_permission(permission_id: str) -> Optional[Permission]:
    """Get a permission by ID."""
    return PERMISSIONS.get(permission_id)


def get_role_permissions(role_id: str) -> set[str]:
    """Get all permissions for a role, including inherited ones."""
    role = ROLES.get(role_id)
    if not role:
        return set()
    return role.get_all_permissions(ROLES)


def check_permission(granted: list[str], required: str) -> bool:
    """
    Check if a permission is granted.

    Supports wildcards: "users:*" matches "users:read"
    """
    for p in granted:
        if p == "*":
            return True
        if p == required:
            return True
        if p.endswith(":*"):
            resource = p[:-2]
            if required.startswith(f"{resource}:"):
                return True
    return False
