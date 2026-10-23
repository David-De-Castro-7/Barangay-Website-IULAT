
/* =========================================================
   iULAT AUTHENTICATION JAVASCRIPT
   Resident Login and Registration
   Connected to the iUlat Node.js + MySQL backend
   ========================================================= */


/* =========================================================
   1. PASSWORD VISIBILITY TOGGLE
   ========================================================= */

document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-toggle-password]");

    if (!toggle) return;

    const inputId = toggle.getAttribute("data-toggle-password");
    const input = document.getElementById(inputId);

    if (!input) {
        console.error(`Password input #${inputId} was not found.`);
        return;
    }

    const showPassword = input.type === "password";
    input.type = showPassword ? "text" : "password";

    toggle.setAttribute(
        "aria-label",
        showPassword ? "Hide password" : "Show password"
    );

    toggle.setAttribute("aria-pressed", String(showPassword));

    toggle.innerHTML = showPassword
        ? `<svg viewBox="0 0 24 24" width="20" height="20"
             fill="none" stroke="currentColor" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round"
             aria-hidden="true">
             <path d="M3 3l18 18"/>
             <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
             <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.9"/>
             <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.1 0 2.1-.2 3-.5"/>
           </svg>`
        : `<svg viewBox="0 0 24 24" width="20" height="20"
             fill="none" stroke="currentColor" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round"
             aria-hidden="true">
             <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/>
             <circle cx="12" cy="12" r="3"/>
           </svg>`;
});


/* =========================================================
   2. SHARED FORM HELPERS
   ========================================================= */

function getStatusElement(form) {
    return form.querySelector(".form-status");
}

function showStatus(form, message, type = "info") {
    const status = getStatusElement(form);

    if (!status) {
        console.warn("No .form-status element was found in the form.");
        return;
    }

    status.textContent = message;
    status.className = `form-status is-${type}`;
}

function clearStatus(form) {
    const status = getStatusElement(form);

    if (!status) return;

    status.textContent = "";
    status.className = "form-status";
}

function showFieldError(input, message) {
    if (!input) return;

    const group = input.closest(".form-group");
    const error = group?.querySelector(".field-error");

    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");

    if (error) {
        error.textContent = message;
    }

    input.focus();
}

function clearFieldError(input) {
    if (!input) return;

    const group = input.closest(".form-group");
    const error = group?.querySelector(".field-error");

    input.classList.remove("is-invalid");
    input.removeAttribute("aria-invalid");

    if (error) {
        error.textContent = "";
    }
}

function getField(form, name) {
    return form.querySelector(`[name="${name}"]`);
}

function getFieldValue(form, name) {
    return getField(form, name)?.value?.trim() ?? "";
}

document.addEventListener("input", (event) => {
    if (event.target.matches(".form-control")) {
        clearFieldError(event.target);
        clearStatus(event.target.form);
    }
});

document.addEventListener("change", (event) => {
    if (event.target.matches(".form-control")) {
        clearFieldError(event.target);
        clearStatus(event.target.form);
    }
});


/* =========================================================
   3. CURRENT YEAR
   ========================================================= */

document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
});


/* =========================================================
   4. DEMO LINKS
   ========================================================= */

document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-demo-link]");

    if (!link) return;

    event.preventDefault();

    const message = link.getAttribute("data-demo-link");
    const form = link.closest("form");

    if (form) {
        showStatus(form, message, "info");
    } else {
        alert(message);
    }
});


/* =========================================================
   5. BIRTHDATE AND AGE CALCULATION
   ========================================================= */

const birthdateInput =
    document.getElementById("birthDate") ||
    document.getElementById("birthdate");

const ageInput = document.getElementById("age");

function calculateAge(dateValue) {
    if (!dateValue) return "";

    const birthdate = new Date(`${dateValue}T00:00:00`);
    const today = new Date();

    if (
        Number.isNaN(birthdate.getTime()) ||
        birthdate > today
    ) {
        return "";
    }

    let age = today.getFullYear() - birthdate.getFullYear();

    const birthdayNotReached =
        today.getMonth() < birthdate.getMonth() ||
        (
            today.getMonth() === birthdate.getMonth() &&
            today.getDate() < birthdate.getDate()
        );

    if (birthdayNotReached) {
        age--;
    }

    return age >= 0 ? age : "";
}

function updateAge() {
    if (!birthdateInput || !ageInput) return;

    ageInput.value = calculateAge(birthdateInput.value);
}

if (birthdateInput && ageInput) {
    birthdateInput.addEventListener("input", updateAge);
    birthdateInput.addEventListener("change", updateAge);
    updateAge();
}


/* =========================================================
   6. API CONFIGURATION
   ========================================================= */

const API_BASE_URL = "http://localhost:3000/api";

async function sendApiRequest(endpoint, data = null, token = null) {
    const isGetRequest = endpoint.endsWith("/me");

    const headers = {
        Accept: "application/json"
    };

    if (!isGetRequest) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: isGetRequest ? "GET" : "POST",
            headers,
            ...(!isGetRequest && data
                ? { body: JSON.stringify(data) }
                : {})
        });
    } catch (error) {
        console.error("API connection error:", error);

        throw new Error(
            "Cannot connect to the iUlat server. Make sure your backend is running at http://localhost:3000."
        );
    }

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(
            result.message || `Request failed with status ${response.status}.`
        );

        error.status = response.status;
        error.data = result;

        throw error;
    }

    return result;
}


/* =========================================================
   7. RESIDENT REGISTRATION — BACKEND
   ========================================================= */

const registerForm = document.querySelector(
    '[data-auth-form="resident-register"]'
);

if (registerForm) {
    /*
     * The current API accepts JSON and does not upload ID photos.
     * ID verification should be completed through the barangay's
     * verification process instead.
     */
    const idFileInput = getField(registerForm, "validIdFile");

    if (idFileInput) {
        idFileInput.required = false;
    }

    /*
     * Validate the Terms checkbox inside the submit handler so
     * the user receives our own message if it is unchecked.
     */
    const termsCheckbox = getField(registerForm, "agreeTerms");

    if (termsCheckbox) {
        termsCheckbox.required = false;
    }

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        clearStatus(registerForm);

        if (termsCheckbox) {
            clearFieldError(termsCheckbox);
        }

        const requiredInputs = Array.from(
            registerForm.querySelectorAll(
                "input[required], select[required], textarea[required]"
            )
        ).filter((input) => input !== termsCheckbox);

        requiredInputs.forEach(clearFieldError);

        // Validate required fields first.
        for (const input of requiredInputs) {
            if (input.type === "file") {
                continue;
            }

            if (!input.checkValidity()) {
                const message = input.validity.valueMissing
                    ? "This field is required."
                    : input.validity.typeMismatch
                        ? "Please enter a valid value."
                        : "Please check this field.";

                showFieldError(input, message);
                return;
            }
        }

        // Validate the Terms checkbox.
        if (!termsCheckbox || !termsCheckbox.checked) {
            showStatus(
                registerForm,
                "Please agree to the Terms & Conditions and Privacy Policy before registering.",
                "error"
            );

            termsCheckbox?.focus();
            return;
        }

        // Validate password.
        const password = getField(registerForm, "password");
        const confirmPassword = getField(
            registerForm,
            "confirmPassword"
        );

        if (!password || password.value.length < 8) {
            showFieldError(
                password,
                "Password must contain at least 8 characters."
            );
            return;
        }

        if (!confirmPassword || password.value !== confirmPassword.value) {
            showFieldError(
                confirmPassword,
                "Passwords do not match."
            );
            return;
        }

        // Validate birthdate.
        const birthdate = getField(registerForm, "birthDate");

        if (birthdate && calculateAge(birthdate.value) === "") {
            showFieldError(
                birthdate,
                "Please enter a valid birthdate that is not in the future."
            );
            return;
        }

        // Read form values.
        const familyMembersValue = getFieldValue(
            registerForm,
            "familyMembers"
        );

        const yearsResidencyValue = getFieldValue(
            registerForm,
            "yearsResidency"
        );

        /*
         * These property names must match the backend controller.
         * The acceptedTerms property confirms the checkbox selection.
         * The ID file is intentionally not included in this JSON payload.
         */
        const payload = {
            firstName: getFieldValue(registerForm, "firstName"),
            middleName: getFieldValue(registerForm, "middleName"),
            lastName: getFieldValue(registerForm, "lastName"),

            birthdate: getFieldValue(registerForm, "birthDate"),
            placeOfBirth: getFieldValue(registerForm, "placeOfBirth"),
            gender: getFieldValue(registerForm, "gender"),
            civilStatus: getFieldValue(registerForm, "civilStatus"),
            nationality: getFieldValue(registerForm, "nationality"),

            completeAddress: getFieldValue(registerForm, "address"),
            yearsOfResidency: yearsResidencyValue
                ? Number(yearsResidencyValue)
                : null,

            mobileNumber: getFieldValue(registerForm, "phone"),
            email: getFieldValue(registerForm, "email"),

            voterStatus: getFieldValue(registerForm, "voterStatus"),
            isHouseholdHead:
                getFieldValue(registerForm, "householdHead") === "yes",

            familyMembers: familyMembersValue
                ? Number(familyMembersValue)
                : null,

            emergencyContactName: getFieldValue(
                registerForm,
                "emergencyName"
            ),
            emergencyContactNumber: getFieldValue(
                registerForm,
                "emergencyPhone"
            ),
            emergencyRelationship: getFieldValue(
                registerForm,
                "emergencyRelationship"
            ),

            disabilitySpecialNeeds: getFieldValue(
                registerForm,
                "specialNeeds"
            ),

            validIdType: getFieldValue(registerForm, "validIdType"),

            password: password.value,
            acceptedTerms: termsCheckbox.checked
        };

        const submitButton = registerForm.querySelector(
            '[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            showStatus(
                registerForm,
                "Submitting your registration...",
                "info"
            );

            const result = await sendApiRequest(
                "/auth/resident/register",
                payload
            );

            registerForm.reset();

            if (ageInput) {
                ageInput.value = "";
            }

            showStatus(
                registerForm,
                result.message ||
                    "Your registration was submitted successfully. Your account is pending barangay verification.",
                "success"
            );

            getStatusElement(registerForm)?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        } catch (error) {
            console.error("Resident registration error:", error);

            showStatus(
                registerForm,
                error.message ||
                    "Registration failed. Please check your information and try again.",
                "error"
            );

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}


/* =========================================================
   8. RESIDENT LOGIN — BACKEND
   ========================================================= */

const loginForm = document.querySelector(
    '[data-auth-form="resident-login"]'
);

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        clearStatus(loginForm);

        const email = getField(loginForm, "email");
        const password = getField(loginForm, "password");

        clearFieldError(email);
        clearFieldError(password);

        if (!email || !email.value.trim()) {
            showFieldError(email, "Please enter your email address.");
            return;
        }

        if (!email.checkValidity()) {
            showFieldError(email, "Please enter a valid email address.");
            return;
        }

        if (!password || !password.value) {
            showFieldError(password, "Please enter your password.");
            return;
        }

        const submitButton = loginForm.querySelector(
            '[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            showStatus(loginForm, "Signing in...", "info");

            const result = await sendApiRequest(
                "/auth/resident/login",
                {
                    email: email.value.trim(),
                    password: password.value
                }
            );

            const token = result.token || result.accessToken;

            if (!token) {
                throw new Error(
                    "The server did not return a login token. Check the response in auth.controller.js."
                );
            }

            // Keep the authentication token in this browser tab.
            sessionStorage.setItem("iulatResidentToken", token);

            showStatus(
                loginForm,
                "Sign-in successful. Opening your account...",
                "success"
            );

            // Update this path if your resident profile page has a different location.
            window.location.href = "../resident/resident-profile.html";

        } catch (error) {
            console.error("Resident login error:", error);

            if (error.status === 403) {
                showStatus(
                    loginForm,
                    error.message ||
                        "Your account may still be awaiting barangay verification.",
                    "error"
                );
            } else {
                showStatus(
                    loginForm,
                    error.message ||
                        "Unable to sign in. Please check your details and try again.",
                    "error"
                );
            }

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}


/* =========================================================
   9. INITIALIZATION MESSAGE
   ========================================================= */

console.log("iUlat authentication script loaded successfully.");
