// MongoDB Script to Make a User Super Admin
// Usage: mongosh <connection-string> < make-superadmin.js
// Or: Copy and paste into MongoDB shell

// ============================================
// CONFIGURATION - CHANGE THESE VALUES
// ============================================
const USER_EMAIL = "your-email@example.com";  // ⬅️ CHANGE THIS
const DATABASE_NAME = "your_database_name";    // ⬅️ CHANGE THIS (or remove if using connection string with DB)

// ============================================
// SCRIPT - DO NOT MODIFY BELOW
// ============================================

// Switch to database (if not already connected to specific DB)
if (DATABASE_NAME && DATABASE_NAME !== "your_database_name") {
  use(DATABASE_NAME);
}

print("🔍 Looking for user: " + USER_EMAIL);
print("");

// Find the user
const user = db.users.findOne({ email: USER_EMAIL });

if (!user) {
  print("❌ ERROR: User not found with email: " + USER_EMAIL);
  print("");
  print("💡 Try finding the user manually:");
  print("   db.users.find({ email: /your-email/ }).pretty()");
  print("");
  print("Or check all users:");
  print("   db.users.find({}, { email: 1, name: 1 }).pretty()");
  exit(1);
}

print("✅ User found:");
print("   Email: " + user.email);
print("   Name: " + (user.name || "N/A"));
print("   Current Role: " + (user.role || "student"));
print("");

// Super admin permissions
const superAdminPermissions = [
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
];

// Update user to superadmin
print("🔄 Updating user to superadmin...");
const result = db.users.updateOne(
  { email: USER_EMAIL },
  {
    $set: {
      role: "superadmin",
      isSuperAdmin: true,
      isAdmin: true,
      isTeacher: true,
      permissions: superAdminPermissions,
      updatedAt: new Date()
    }
  }
);

if (result.modifiedCount > 0) {
  print("");
  print("✅ SUCCESS! User has been updated to superadmin.");
  print("");
  
  // Verify the update
  const updatedUser = db.users.findOne({ email: USER_EMAIL });
  print("📋 Updated User Details:");
  print("   Email: " + updatedUser.email);
  print("   Role: " + updatedUser.role);
  print("   isSuperAdmin: " + updatedUser.isSuperAdmin);
  print("   isAdmin: " + updatedUser.isAdmin);
  print("   isTeacher: " + updatedUser.isTeacher);
  print("   Permissions: " + (updatedUser.permissions?.length || 0) + " permissions");
  print("");
  print("🎉 Next Steps:");
  print("   1. Sign out from your application");
  print("   2. Sign in again (this syncs the role)");
  print("   3. Navigate to /admin to access admin panel");
  print("   4. (Optional) Update Clerk metadata in Clerk Dashboard");
} else if (result.matchedCount === 0) {
  print("❌ ERROR: User not found. Check the email address.");
} else {
  print("⚠️  WARNING: User found but no changes were made.");
  print("   User might already be a superadmin, or there was an issue.");
  print("");
  print("Current user state:");
  const currentUser = db.users.findOne({ email: USER_EMAIL });
  printjson({
    role: currentUser.role,
    isSuperAdmin: currentUser.isSuperAdmin,
    isAdmin: currentUser.isAdmin,
    isTeacher: currentUser.isTeacher
  });
}

