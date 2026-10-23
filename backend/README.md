# iUlat Node.js + MySQL starter (resident auth first)

This backend starter provides:
- MySQL schema for resident registration details
- Node.js/Express API
- Password hashing with bcrypt
- Resident registration with duplicate email/mobile checks
- Resident login restricted to `approved` accounts (new registrations default to `pending`)
- JWT-protected `/api/auth/me` profile endpoint
- Basic CORS, Helmet security headers, and auth rate limiting

## 1. Install prerequisites
Install Node.js 20+ and MySQL Server. You can use MySQL Workbench or phpMyAdmin if your MySQL installation includes it.

## 2. Open the project in VS Code
Extract this ZIP. Open the extracted folder in VS Code. Open Terminal → New Terminal.

## 3. Create the database
Run the SQL in `database/schema.sql` using MySQL Workbench or the MySQL CLI.
The app database user should have only the privileges it needs. Example SQL (run as a MySQL admin, then change the password):
```sql
CREATE USER 'iulat_app'@'localhost' IDENTIFIED BY 'replace_with_a_strong_local_password';
GRANT SELECT, INSERT ON iulat_db.residents TO 'iulat_app'@'localhost';
FLUSH PRIVILEGES;
```
If you want to test the future official approval workflow, an admin account will later need carefully scoped `UPDATE` permissions. Do not use the MySQL root account in the app's `.env`.

## 4. Configure environment
Copy `.env.example` to a new file named `.env`.
Edit `.env` to match your MySQL username/password. Set `JWT_SECRET` to a long random secret (32+ characters). Keep `.env` private; it is ignored by Git.

## 5. Install dependencies and start
```bash
npm install
npm run dev
```
Expected terminal output:
- `MySQL connection successful.`
- `iUlat API running at http://localhost:3000`

## 6. Test the API
Open this URL in your browser:
`http://localhost:3000/api/health`
Expected:
```json
{"status":"ok","database":"connected"}
```
Use Postman or Thunder Client for registration:
```json
{
  "firstName": "Juan",
  "middleName": "Dela Cruz",
  "lastName": "Santos",
  "birthdate": "1998-04-15",
  "placeOfBirth": "Imus, Cavite",
  "gender": "Male",
  "civilStatus": "Single",
  "nationality": "Filipino",
  "completeAddress": "Sample Street, Barangay Sample, Imus, Cavite",
  "yearsOfResidency": 5,
  "mobileNumber": "09171234567",
  "email": "juan.santos@example.com",
  "voterStatus": "Registered",
  "isHouseholdHead": false,
  "familyMembers": 4,
  "emergencyContactName": "Maria Santos",
  "emergencyContactNumber": "09181234567",
  "emergencyRelationship": "Mother",
  "disabilitySpecialNeeds": "",
  "validIdType": "Philippine National ID",
  "password": "SamplePass123!",
  "acceptedTerms": true
}
```
Use a test email/number only. New accounts are `pending`, so login returns a pending-verification response until an official approval workflow is built.

## Notes and next steps
- The API does not yet accept ID/profile file uploads; those require a separate protected upload route and private storage.
- The existing frontend form has to be wired to `auth-api.js`; see `frontend-integration/README.md`. Do not assume the existing form field names match without checking.
- No official authentication/approval endpoint exists yet.
- For production, use HTTPS, secure session/cookie handling, robust audit logging, backups, and privacy/retention controls appropriate for Philippine personal data.
