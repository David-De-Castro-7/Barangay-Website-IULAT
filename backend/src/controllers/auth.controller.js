const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(09\d{9}|\+639\d{9})$/;


function cleanString(value, max = 255) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function optionalString(value, max = 255) {
  const result = cleanString(value, max);
  return result || null;
}

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, role: 'resident', email: user.email },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '2h', issuer: 'iulat-api', audience: 'iulat-web' }
  );
}

function publicUser(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    middleName: row.middle_name,
    lastName: row.last_name,
    email: row.email,
    mobileNumber: row.mobile_number,
    accountStatus: row.account_status
  };
}

async function registerResident(req, res) {
  const body = req.body || {};
  const firstName = cleanString(body.firstName, 100);
  const middleName = optionalString(body.middleName, 100);
  const lastName = cleanString(body.lastName, 100);
  const birthdate = cleanString(body.birthdate, 10);
  const placeOfBirth = optionalString(body.placeOfBirth, 255);
  const gender = optionalString(body.gender, 40);
  const civilStatus = optionalString(body.civilStatus, 40);
  const nationality = cleanString(body.nationality || 'Filipino', 80);
  const completeAddress = cleanString(body.completeAddress, 1000);
  const yearsOfResidency = body.yearsOfResidency === '' || body.yearsOfResidency == null
    ? null : Number(body.yearsOfResidency);
  const mobileNumber = cleanString(body.mobileNumber, 20);
  const email = cleanString(body.email, 254).toLowerCase();
  const voterStatus = optionalString(body.voterStatus, 40);
  const isHouseholdHead = body.isHouseholdHead === true || body.isHouseholdHead === 'yes';
  const familyMembers = body.familyMembers === '' || body.familyMembers == null
    ? null : Number(body.familyMembers);
  const emergencyContactName = optionalString(body.emergencyContactName, 200);
  const emergencyContactNumber = optionalString(body.emergencyContactNumber, 20);
  const emergencyRelationship = optionalString(body.emergencyRelationship, 80);
  const disabilitySpecialNeeds = optionalString(body.disabilitySpecialNeeds, 1000);
  const validIdType = cleanString(body.validIdType, 80);
  const password = typeof body.password === 'string' ? body.password : '';
  const acceptedTerms = body.acceptedTerms === true;

  if (!firstName || !lastName || !birthdate || !completeAddress || !mobileNumber || !email || !validIdType || !password) {
    return res.status(400).json({ message: 'Please complete all required fields.' });
  }
  if (!emailPattern.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  if (!phonePattern.test(mobileNumber)) {
    return res.status(400).json({ message: 'Enter a valid Philippine mobile number, such as 09171234567 or +639171234567.' });
  }
  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({ message: 'Password must be between 8 and 72 characters.' });
  }
  if (!acceptedTerms) return res.status(400).json({ message: 'You must agree to the Terms & Conditions and Privacy Policy.' });
  if (yearsOfResidency !== null && (!Number.isInteger(yearsOfResidency) || yearsOfResidency < 0 || yearsOfResidency > 120)) {
    return res.status(400).json({ message: 'Years of residency must be a valid non-negative number.' });
  }
  if (familyMembers !== null && (!Number.isInteger(familyMembers) || familyMembers < 1 || familyMembers > 100)) {
    return res.status(400).json({ message: 'Number of family members must be between 1 and 100.' });
  }
  const date = new Date(`${birthdate}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== birthdate) {
    return res.status(400).json({ message: 'Enter a valid birthdate.' });
  }
  if (date > new Date()) return res.status(400).json({ message: 'Birthdate cannot be in the future.' });

  try {
    const [existing] = await pool.execute(
      'SELECT id FROM residents WHERE email = ? OR mobile_number = ? LIMIT 1',
      [email, mobileNumber]
    );
    if (existing.length) return res.status(409).json({ message: 'An account with that email or mobile number already exists.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      `INSERT INTO residents
      (first_name, middle_name, last_name, birthdate, place_of_birth, gender, civil_status, nationality,
       complete_address, years_of_residency, mobile_number, email, voter_status, is_household_head,
       family_members, emergency_contact_name, emergency_contact_number, emergency_relationship,
       disability_special_needs, valid_id_type, password_hash, terms_accepted_at, account_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'pending')`,
      [
        firstName, middleName, lastName, birthdate, placeOfBirth, gender, civilStatus, nationality,
        completeAddress, yearsOfResidency, mobileNumber, email, voterStatus, isHouseholdHead,
        familyMembers, emergencyContactName, emergencyContactNumber, emergencyRelationship,
        disabilitySpecialNeeds, validIdType, passwordHash
      ]
    );
    return res.status(201).json({
      message: 'Registration submitted. Your account is pending barangay verification.',
      residentId: result.insertId,
      accountStatus: 'pending'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'An account with that email or mobile number already exists.' });
    }
    console.error('Resident registration failed:', error);
    return res.status(500).json({ message: 'Unable to complete registration right now.' });
  }
}

async function loginResident(req, res) {
  const email = cleanString(req.body?.email, 254).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!emailPattern.test(email) || !password) {
    return res.status(400).json({ message: 'Enter your email address and password.' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT id, first_name, middle_name, last_name, email, mobile_number,
              account_status, password_hash
       FROM residents WHERE email = ? LIMIT 1`,
      [email]
    );
    const resident = rows[0];
    const matches = resident ? await bcrypt.compare(password, resident.password_hash) : false;
    if (!matches) return res.status(401).json({ message: 'Incorrect email or password.' });
    if (resident.account_status !== 'approved') {
      return res.status(403).json({
        message: resident.account_status === 'rejected'
          ? 'Your registration was not approved. Please contact the barangay office.'
          : 'Your account is awaiting barangay verification.',
        accountStatus: resident.account_status
      });
    }

    const token = issueToken(resident);
    return res.json({ message: 'Sign-in successful.', token, user: publicUser(resident) });
  } catch (error) {
    console.error('Resident login failed:', error);
    return res.status(500).json({ message: 'Unable to sign in right now.' });
  }
}

async function getMyProfile(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, first_name, middle_name, last_name, email, mobile_number, account_status
       FROM residents WHERE id = ? LIMIT 1`,
      [req.auth.sub]
    );
    if (!rows.length) return res.status(404).json({ message: 'Account not found.' });
    return res.json({ user: publicUser(rows[0]) });
  } catch (error) {
    console.error('Profile lookup failed:', error);
    return res.status(500).json({ message: 'Unable to load your profile right now.' });
  }
}

module.exports = { registerResident, loginResident, getMyProfile };
