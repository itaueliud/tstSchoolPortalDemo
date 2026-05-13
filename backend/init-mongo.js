db.createUser({
  user: "school_portal_user",
  pwd: "school_portal_password",
  roles: [
    {
      role: "readWrite",
      db: "school_portal"
    }
  ]
});

db.createCollection("auth_users");
db.createCollection("school_classes");
db.createCollection("student_profiles");
db.createCollection("teacher_profiles");
db.createCollection("parent_profiles");
db.createCollection("announcements");
db.createCollection("attendance_records");
db.createCollection("fee_invoices");
db.createCollection("assignments");
db.createCollection("grade_records");
db.createCollection("mark_entries");
db.createCollection("student_results");

print("MongoDB initialized for school portal");
