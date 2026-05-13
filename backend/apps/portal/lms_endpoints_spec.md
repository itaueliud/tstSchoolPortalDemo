# LMS “B” endpoints spec (teacher + student)

This document describes the endpoints we still need to add to `backend/apps/portal` to make Learning Management production-ready.

## 1) Assignment CRUD (teacher)
### `GET /api/dashboard/assignments/?school_class_id=<id>`
- Returns assignments for a class; optionally filter by published status.
- Role: teacher
- Response: `{ items: [ {id,title,subject,due_date,school_class,is_published} ] }`

### `POST /api/dashboard/assignments/`
- Create assignment
- Role: teacher/admin
- Body: `{ title, subject, due_date, school_class_id, is_published }`

### `PATCH /api/dashboard/assignments/<id>/`
- Update assignment

### `DELETE /api/dashboard/assignments/<id>/`

## 2) Publish / unpublish
- Use same assignment PATCH/PUT fields via `is_published`.

## 3) Student submissions
### `GET /api/dashboard/assignments/<assignment_id>/submissions/`
- Teacher: list submissions for assignment (and optionally class)

### `POST /api/dashboard/assignments/<assignment_id>/submissions/`
- Student: create submission
- Role: student
- Body: `{ content }` (plain text in this demo; file storage can be added later)
- Behavior: upsert by (assignment, student)

## 4) Teacher feedback/grade for submissions
### `PATCH /api/dashboard/submissions/<submission_id>/`
- Teacher: update teacher_feedback, score/max_score, status

## 5) Student view results/status
### `GET /api/dashboard/assignments/` (student)
- Returns only published assignments

### `GET /api/dashboard/submissions/?assignment_id=<id>`
- Student: returns their submission status + teacher_feedback + grading fields (if graded)

## Notes
- Current backend already includes:
  - `Assignment` model (with `is_published`)
  - `AssignmentSubmission` model (new)
  - Serializers for assignment + submission + grading
- Remaining work:
  - Implement DRF views + urls for the endpoints above.

