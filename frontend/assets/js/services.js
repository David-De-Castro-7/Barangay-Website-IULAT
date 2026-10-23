
document.addEventListener("DOMContentLoaded", () => {
    const cards = Array.from(
        document.querySelectorAll(".service-card")
    );

    const dialog = document.getElementById("service-dialog");
    const title = document.getElementById("dialog-title");
    const description = document.getElementById("dialog-description");
    const requirements = document.getElementById("dialog-requirements");

    const resetButton = document.getElementById("reset-filters");

    const serviceInfo = {
        clearance: {
            title: "Barangay Clearance",
            description:
                "General guidance for requesting a barangay clearance. Confirm the official process with your barangay office.",
            requirements: [
                "Valid identification, if required",
                "Proof of residence, if required",
                "Completed request form, if required",
                "Confirm any applicable fee with the barangay office"
            ]
        },

        residency: {
            title: "Certificate of Residency",
            description:
                "Information about requesting proof of residence in your barangay.",
            requirements: [
                "Valid identification, if required",
                "Proof of current address, if required",
                "Completed request form, if required",
                "Confirm any additional local requirements"
            ]
        },

        indigency: {
            title: "Certificate of Indigency",
            description:
                "This certificate may support an application for eligible assistance programs.",
            requirements: [
                "Valid identification, if required",
                "Proof of residence, if required",
                "Explain the purpose of the request",
                "Confirm supporting documents with the barangay office"
            ]
        },

        business: {
            title: "Barangay Business Clearance",
            description:
                "General guidance for a business-related barangay clearance. Requirements can vary by business and locality.",
            requirements: [
                "Business details and location",
                "Valid identification of the applicant",
                "Business documents specified by the barangay",
                "Confirm fees and other permits with the relevant offices"
            ]
        },

        assistance: {
            title: "Community Assistance",
            description:
                "Ask about available community assistance programs, referrals, and eligibility requirements.",
            requirements: [
                "Identify the assistance program",
                "Confirm eligibility criteria",
                "Prepare the supporting documents requested by the program",
                "Verify application dates and submission instructions"
            ]
        },

        other: {
            title: "Other Document Requests",
            description:
                "Contact the barangay office to ask whether it provides the document or service you need.",
            requirements: [
                "Identify the document or service",
                "Explain the purpose of the request",
                "Ask which identification and supporting documents are needed",
                "Confirm the process, fees, and expected processing time"
            ]
        }
    };

    // Open the correct service dialog.
    document.querySelectorAll(".service-details").forEach((button) => {
        button.addEventListener("click", () => {
            const info = serviceInfo[button.dataset.service];

            if (!info || !dialog || !title || !description || !requirements) {
                return;
            }

            title.textContent = info.title;
            description.textContent = info.description;
            requirements.replaceChildren();

            info.requirements.forEach((requirement) => {
                const item = document.createElement("li");
                item.textContent = requirement;
                requirements.appendChild(item);
            });

            if (typeof dialog.showModal === "function") {
                dialog.showModal();
            }
        });
    });

    // Close buttons in the dialog.
    document.querySelectorAll(".dialog-close").forEach((button) => {
        button.addEventListener("click", () => {
            if (dialog?.open) {
                dialog.close();
            }
        });
    });

    // Close when clicking the backdrop.
    dialog?.addEventListener("click", (event) => {
        if (event.target === dialog) {
            dialog.close();
        }
    });

    // Reset button: show all six cards.
    resetButton?.addEventListener("click", () => {
        cards.forEach((card) => {
            card.hidden = false;
        });
    });
});