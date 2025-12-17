// MongoDB Script to Update Ram Lalit Sharma to Super Admin
// Run this in MongoDB shell

// Update the specific user by email or clerkId
db.users.updateOne(
  { 
    $or: [
      { email: "ramlalitsharma01@gmail.com" },
      { clerkId: "user_34vSyNej0gYkDesjGWP7aB7EOMp" }
    ]
  },
  {
    $set: {
      role: "superadmin",
      isSuperAdmin: true,
      isAdmin: true,
      isTeacher: true,
      permissions: [
        "superadmin:access",
        "admin:create",
        "teacher:create",
        "admin:access",
        "teacher:access",
        "users:manage",
        "users:create",
        "roles:manage",
        "content:create",
        "content:publish",
        "content:moderate",
        "analytics:view",
        "finance:view",
        "notifications:manage",
        "schemas:manage",
        "videos:manage"
      ],
      updatedAt: new Date()
    }
  }
)

// Verify the update
print("✅ Updated user. Verifying...");
const updated = db.users.findOne({ email: "ramlalitsharma01@gmail.com" });
printjson({
  email: updated.email,
  name: updated.name,
  role: updated.role,
  isSuperAdmin: updated.isSuperAdmin,
  isAdmin: updated.isAdmin,
  isTeacher: updated.isTeacher,
  permissionsCount: updated.permissions?.length || 0
});

