
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const profileForm = document.getElementById("profileForm");
    const addressForm = document.getElementById("addressForm");

    const profileFields = document.getElementById("profileFields");
    const addressFields = document.getElementById("addressFields");

    const profileFormActions = document.getElementById("profileFormActions");
    const addressFormActions = document.getElementById("addressFormActions");
    const addressEditRow = document.getElementById("addressEditRow");

    const editProfileButton = document.getElementById("editProfileButton");
    const cancelEditButton = document.getElementById("cancelEditButton");

    const editAddressButton = document.getElementById("editAddressButton");
    const cancelAddressButton = document.getElementById("cancelAddressButton");

    const saveProfileButton = document.getElementById("saveProfileButton");
    const saveAddressButton = document.getElementById("saveAddressButton");

    const profileMessage = document.getElementById("profileMessage");

    const sidebar = document.getElementById("profileSidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const sidebarToggle = document.getElementById("sidebarToggle");

    const sidebarSignOut = document.getElementById("sidebarSignOut");

    const profileNames = [
        "firstName", "middleName", "lastName", "suffix",
        "birthDate", "sex", "civilStatus", "email", "phone"
    ];

    const addressNames = [
        "houseNumber", "barangay", "city", "province", "postalCode"
    ];

    let originalProfile = {};
    let originalAddress = {};

    function getValues(names) {
        const values = {};

        names.forEach((name) => {
            const input = document.getElementById(name);
            if (input) values[name] = input.value;
        });

        return values;
    }

    function setValues(values, names) {
        names.forEach((name) => {
            const input = document.getElementById(name);

            if (input && Object.hasOwn(values, name)) {
                input.value = values[name] ?? "";
            }
        });
    }

    function showMessage(message, type = "info") {
        if (!profileMessage) return;

        profileMessage.textContent = message;
        profileMessage.className = `profile-message ${type}`;
        profileMessage.hidden = false;
    }

    function clearMessage() {
        if (!profileMessage) return;

        profileMessage.textContent = "";
        profileMessage.hidden = true;
        profileMessage.className = "profile-message";
    }

    function clearErrors(form) {
        if (!form) return;

        form.querySelectorAll(".profile-field-error").forEach((error) => {
            error.textContent = "";
        });

        form.querySelectorAll("[aria-invalid='true']").forEach((input) => {
            input.removeAttribute("aria-invalid");
        });
    }

    function setError(name, message) {
        const input = document.getElementById(name);
        const error = document.getElementById(`${name}Error`);

        if (input) input.setAttribute("aria-invalid", "true");
        if (error) error.textContent = message;
    }

    function validateRequired(form) {
        clearErrors(form);

        let valid = true;
        let firstInvalid = null;

        form.querySelectorAll("[required]").forEach((input) => {
            if (!input.value.trim()) {
                setError(input.id, "This field is required.");
                valid = false;
                firstInvalid ??= input;
            }
        });

        if (firstInvalid) firstInvalid.focus();

        return valid;
    }

    function calculateAge(value) {
        if (!value) return "";

        const birthDate = new Date(`${value}T00:00:00`);
        const today = new Date();

        if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
            return "";
        }

        let age = today.getFullYear() - birthDate.getFullYear();

        if (
            today.getMonth() < birthDate.getMonth() ||
            (
                today.getMonth() === birthDate.getMonth() &&
                today.getDate() < birthDate.getDate()
            )
        ) {
            age--;
        }

        return age >= 0 ? String(age) : "";
    }

    function updateAge() {
        const birthDate = document.getElementById("birthDate");
        const age = document.getElementById("age");

        if (birthDate && age) {
            age.value = calculateAge(birthDate.value);
        }
    }

    function updateProfileSummary() {
        const firstName = document.getElementById("firstName")?.value.trim() || "";
        const middleName = document.getElementById("middleName")?.value.trim() || "";
        const lastName = document.getElementById("lastName")?.value.trim() || "";
        const suffix = document.getElementById("suffix")?.value.trim() || "";
        const email = document.getElementById("email")?.value.trim() || "";

        const fullName = [firstName, middleName, lastName, suffix]
            .filter(Boolean)
            .join(" ");

        const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`
            .toUpperCase() || "R";

        const summaryName = document.getElementById("summaryName");
        const summaryEmail = document.getElementById("summaryEmail");
        const profileAvatar = document.getElementById("profileAvatar");
        const headerAvatar = document.getElementById("headerAvatar");

        if (summaryName) {
            summaryName.textContent = fullName || "Resident Profile";
        }

        if (summaryEmail) {
            summaryEmail.textContent = email;
        }

        if (profileAvatar) profileAvatar.textContent = initials;
        if (headerAvatar) headerAvatar.textContent = initials;
    }

    function setProfileEditing(editing) {
        if (profileFields) profileFields.disabled = !editing;
        if (profileFormActions) profileFormActions.hidden = !editing;
        if (editProfileButton) editProfileButton.hidden = editing;

        if (editing) {
            document.getElementById("firstName")?.focus();
        }
    }

    function setAddressEditing(editing) {
        if (addressFields) addressFields.disabled = !editing;
        if (addressFormActions) addressFormActions.hidden = !editing;
        if (addressEditRow) addressEditRow.hidden = editing;

        if (editing) {
            document.getElementById("houseNumber")?.focus();
        }
    }

    function validateProfile() {
        let valid = validateRequired(profileForm);

        const namePattern = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u;
        const firstName = document.getElementById("firstName");
        const lastName = document.getElementById("lastName");
        const birthDate = document.getElementById("birthDate");
        const email = document.getElementById("email");
        const phone = document.getElementById("phone");

        [[ "firstName", firstName ], [ "lastName", lastName ]]
            .forEach(([name, input]) => {
                if (!input?.value.trim()) return;

                if (!namePattern.test(input.value.trim())) {
                    setError(name, "Enter a valid name.");
                    valid = false;
                }
            });

        if (birthDate?.value && !calculateAge(birthDate.value)) {
            setError("birthDate", "Enter a valid date that is not in the future.");
            valid = false;
        }

        if (email?.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email.value.trim())) {
                setError("email", "Enter a valid email address.");
                valid = false;
            }
        }

        if (phone?.value.trim()) {
            const digits = phone.value.replace(/\D/g, "");

            if (digits.length < 10 || digits.length > 15) {
                setError("phone", "Enter a valid phone number.");
                valid = false;
            }
        }

        if (!valid) {
            profileForm.querySelector("[aria-invalid='true']")?.focus();
        }

        return valid;
    }

    function closeSidebar() {
        sidebar?.classList.remove("is-open");
        sidebarOverlay?.classList.remove("is-visible");

        sidebarToggle?.setAttribute("aria-expanded", "false");
        sidebarToggle?.setAttribute("aria-label", "Open navigation menu");

        document.body.classList.remove("profile-sidebar-open");
    }

    function toggleSidebar() {
        if (sidebar?.classList.contains("is-open")) {
            closeSidebar();
            return;
        }

        sidebar?.classList.add("is-open");
        sidebarOverlay?.classList.add("is-visible");

        sidebarToggle?.setAttribute("aria-expanded", "true");
        sidebarToggle?.setAttribute("aria-label", "Close navigation menu");

        document.body.classList.add("profile-sidebar-open");
    }

    // Start with blank fields until real resident data is provided
    // by the backend in a later development phase.
    profileNames.concat(addressNames).forEach((name) => {
        const input = document.getElementById(name);
        if (input) input.value = "";
    });

    originalProfile = getValues(profileNames);
    originalAddress = getValues(addressNames);

    updateAge();
    updateProfileSummary();

    setProfileEditing(false);
    setAddressEditing(false);

    editProfileButton?.addEventListener("click", () => {
        clearMessage();
        clearErrors(profileForm);

        originalProfile = getValues(profileNames);
        setProfileEditing(true);
    });

    cancelEditButton?.addEventListener("click", () => {
        setValues(originalProfile, profileNames);
        updateAge();
        updateProfileSummary();
        clearErrors(profileForm);
        clearMessage();
        setProfileEditing(false);
    });

    profileForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!validateProfile()) {
            showMessage("Please correct the highlighted fields.", "error");
            return;
        }

        // Do not simulate a database save.
        showMessage(
            "Your information has not been saved. Database and backend integration will be added in a later phase.",
            "info"
        );
    });

    document.getElementById("birthDate")?.addEventListener("change", updateAge);

    editAddressButton?.addEventListener("click", () => {
        clearMessage();
        clearErrors(addressForm);

        originalAddress = getValues(addressNames);
        setAddressEditing(true);
    });

    cancelAddressButton?.addEventListener("click", () => {
        setValues(originalAddress, addressNames);
        clearErrors(addressForm);
        clearMessage();
        setAddressEditing(false);
    });

    addressForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!validateRequired(addressForm)) {
            showMessage("Please complete the required address fields.", "error");
            return;
        }

        // Do not simulate a database save.
        showMessage(
            "Your address has not been saved. Database and backend integration will be added in a later phase.",
            "info"
        );
    });

    document.querySelectorAll(".profile-field input, .profile-field select")
        .forEach((input) => {
            ["input", "change"].forEach((eventName) => {
                input.addEventListener(eventName, () => {
                    const error = document.getElementById(`${input.id}Error`);

                    if (error) error.textContent = "";
                    input.removeAttribute("aria-invalid");
                });
            });
        });

    sidebarToggle?.addEventListener("click", toggleSidebar);
    sidebarOverlay?.addEventListener("click", closeSidebar);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeSidebar();
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) closeSidebar();
    });

    // This is navigation only; real session logout requires backend authentication.
    sidebarSignOut?.addEventListener("click", (event) => {
        event.preventDefault();

        window.location.href = sidebarSignOut.href;
    });
});













 /* -----------------------------------------------------
       EDIT PROFILE
       ----------------------------------------------------- */

    if (editButton) {
        editButton.addEventListener("click", () => {
            takeSnapshot();
            clearMessage();
            setEditing(true);

            const firstField = form.querySelector(
                'input:not([type="file"]):not([readonly]), select'
            );

            if (firstField) {
                firstField.focus({ preventScroll: true });
            }
        });
    }

    /* -----------------------------------------------------
       CANCEL EDITING
       ----------------------------------------------------- */

    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            if (savedSnapshot) {
                applyValues(savedSnapshot);
            }

            if (idFileInput) {
                idFileInput.value = "";
            }

            setEditing(false);
            clearMessage();

            showMessage(
                "Your changes were cancelled. The previous profile information has been restored.",
                "info"
            );
        });
    }

    /* -----------------------------------------------------
       SAVE PROFILE
       ----------------------------------------------------- */

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!isEditing) {
            return;
        }

        clearMessage();

        if (!form.reportValidity()) {
            return;
        }

        const values = getValues();

        // Do not allow a future date of birth.
        if (values.birthDate) {
            const age = calculateAge(values.birthDate);

            if (age === "") {
                showMessage(
                    "Please enter a valid date of birth that is not in the future.",
                    "error"
                );

                birthDateInput?.focus();
                return;
            }
        }

        // A selected file is not persisted by this frontend demo.
        if (idFileInput && idFileInput.files && idFileInput.files.length > 0) {
            showMessage(
                "The ID file cannot be uploaded in demo mode. Clear the selected file to save your other profile changes. File uploads will require backend support.",
                "error"
            );

            idFileInput.focus();
            return;
        }

        const saved = saveDemoProfile(values);

        if (!saved) {
            showMessage(
                "The browser could not save your changes. Check browser storage settings and try again.",
                "error"
            );
            return;
        }

        applyValues(values);
        takeSnapshot();
        setEditing(false);

        showMessage(
            "Your profile has been saved in this browser. It has not yet been submitted to the barangay database."
        );
    });