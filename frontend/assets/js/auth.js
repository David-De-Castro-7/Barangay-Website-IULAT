/* =========================================================
   iULAT AUTHENTICATION JAVASCRIPT
   ========================================================= */


/* =========================================================
   PASSWORD TOGGLE
   ========================================================= */

document
    .querySelectorAll(".password-toggle")
    .forEach(function (button) {

        button.addEventListener("click", function () {

            const targetId =
                this.getAttribute("data-target");

            const input =
                document.getElementById(targetId);

            if (!input) {
                return;
            }


            if (input.type === "password") {

                input.type = "text";

                this.textContent = "Hide";

                this.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                input.type = "password";

                this.textContent = "Show";

                this.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        });

    });



/* =========================================================
   AGE CALCULATION
   ========================================================= */

const birthdate =
    document.getElementById("birthdate");

const age =
    document.getElementById("age");


if (birthdate && age) {

    birthdate.addEventListener(
        "change",
        function () {

            if (!this.value) {
                age.value = "";
                return;
            }


            const birth =
                new Date(this.value);

            const today =
                new Date();


            let calculatedAge =
                today.getFullYear() -
                birth.getFullYear();


            const monthDifference =
                today.getMonth() -
                birth.getMonth();


            if (
                monthDifference < 0 ||
                (
                    monthDifference === 0 &&
                    today.getDate() < birth.getDate()
                )
            ) {

                calculatedAge--;

            }


            if (calculatedAge >= 0) {

                age.value =
                    calculatedAge;

            } else {

                age.value = "";

            }

        }
    );

}



/* =========================================================
   RESIDENT LOGIN
   ========================================================= */

const loginForm =
    document.getElementById(
        "residentLoginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const email =
                document.getElementById("email");

            const password =
                document.getElementById("password");

            const error =
                document.getElementById("loginError");


            error.textContent = "";

            error.classList.remove("show");


            if (!email.value.trim()) {

                error.textContent =
                    "Please enter your email address.";

                error.classList.add("show");

                email.focus();

                return;

            }


            if (!password.value) {

                error.textContent =
                    "Please enter your password.";

                error.classList.add("show");

                password.focus();

                return;

            }


            /*
             * BACKEND LOGIN WILL BE CONNECTED HERE.
             *
             * For now, this only performs front-end
             * validation.
             */

            console.log(
                "Resident login submitted."
            );

        }
    );

}



/* =========================================================
   RESIDENT REGISTRATION
   ========================================================= */

const registerForm =
    document.getElementById(
        "residentRegisterForm"
    );


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const password =
                document.getElementById("password");

            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                );

            const passwordError =
                document.getElementById(
                    "passwordError"
                );

            const success =
                document.getElementById(
                    "registrationSuccess"
                );


            passwordError.textContent = "";

            passwordError.classList.remove(
                "show"
            );

            success.classList.remove(
                "show"
            );


            /* PASSWORD LENGTH */

            if (password.value.length < 8) {

                passwordError.textContent =
                    "Password must contain at least 8 characters.";

                passwordError.classList.add(
                    "show"
                );

                password.focus();

                return;

            }


            /* PASSWORD MATCH */

            if (
                password.value !==
                confirmPassword.value
            ) {

                passwordError.textContent =
                    "Passwords do not match.";

                passwordError.classList.add(
                    "show"
                );

                confirmPassword.focus();

                return;

            }


            /* TERMS */

            const terms =
                document.getElementById("terms");


            if (terms && !terms.checked) {

                passwordError.textContent =
                    "Please agree to the Terms & Conditions and Privacy Policy.";

                passwordError.classList.add(
                    "show"
                );

                terms.focus();

                return;

            }


            /*
             * BACKEND REGISTRATION WILL BE
             * CONNECTED HERE.
             *
             * For now we display the successful
             * submission state.
             */

            success.classList.add(
                "show"
            );


            success.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });


            console.log(
                "Resident registration submitted."
            );

        }
    );

}