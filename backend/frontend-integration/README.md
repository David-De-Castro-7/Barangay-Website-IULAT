# Frontend integration notes

This starter includes `auth-api.js`, but the existing resident registration HTML may use different IDs/names.
Before wiring it in, make sure the resident registration form has `id="residentRegisterForm"` and each input has the `name` values below. Do not wire a file upload into this JSON endpoint yet; ID/profile upload needs a separate protected multipart upload endpoint.

Expected registration names:
- firstName, middleName, lastName, birthdate, placeOfBirth, gender, civilStatus, nationality
- completeAddress, yearsOfResidency, mobileNumber, email
- voterStatus, isHouseholdHead (value `yes`/`no`), familyMembers
- emergencyContactName, emergencyContactNumber, emergencyRelationship, disabilitySpecialNeeds
- validIdType, password, acceptedTerms (checkbox)

Expected login names: `email`, `password`.

Register endpoint: `POST http://localhost:3000/api/auth/resident/register`
Login endpoint: `POST http://localhost:3000/api/auth/resident/login`
Profile endpoint: `GET http://localhost:3000/api/auth/me` with `Authorization: Bearer <token>`

For now, store login tokens only in memory while developing if possible. Do not store sensitive resident details or ID files in localStorage. For production, prefer secure, HttpOnly, SameSite cookies and HTTPS.
