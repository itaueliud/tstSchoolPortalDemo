# LMS Production Readiness - Work Log

## Plan (approved)
1. **Backend:** Add missing LMS “B” endpoints + models for assignment publishing + student submissions.
2. **Frontend:** Add `pages/teacher/assignments.tsx` and `pages/student/assignments.tsx` wired to those endpoints.
3. **Integration:** Optionally connect teacher grading/submissions to existing `MarkEntry` + auto `StudentResult` computation.
4. **Validation:** Role-based permissions + consistent API responses.

## Progress
- [x] Inspect existing backend LMS scaffolding (Assignment model exists)
- [x] Add backend models: assignment submissions (+ optional material fields)
- [ ] Add backend serializers for assignment + submissions
- [ ] Add backend API views + urls for assignment CRUD + submission lifecycle
- [ ] Add frontend teacher assignments page
- [ ] Add frontend student assignments page
- [ ] Wire frontend to backend endpoints
- [ ] Run lint/build/tests

