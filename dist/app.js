"use strict";
// Form state management class
class MultiStepForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.storageKey = "multiStepFormData";
        // Initialize with empty data or restore from localStorage
        const savedData = localStorage.getItem(this.storageKey);
        this.formData = savedData
            ? JSON.parse(savedData)
            : {
                name: "",
                dob: "",
                gender: "",
                email: "",
                phone: "",
                address: "",
            };
        this.initForm();
        this.renderCurrentStep();
        this.updateProgressIndicator();
    }
    initForm() {
        var _a, _b, _c;
        // Set up event listeners for navigation buttons
        (_a = document
            .getElementById("nextBtn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => this.nextStep());
        (_b = document
            .getElementById("backBtn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => this.prevStep());
        (_c = document
            .getElementById("submitBtn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => this.submitForm());
        // Set up form inputs event listeners
        const form = document.getElementById("multiStepForm");
        form.addEventListener("input", (e) => {
            const target = e.target;
            if (target.name && target.name in this.formData) {
                this.updateFormData(target.name, target.value);
            }
        });
    }
    updateFormData(field, value) {
        // Type assertion to make TypeScript happy
        this.formData = Object.assign(Object.assign({}, this.formData), { [field]: value });
        // Save to localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(this.formData));
        // Clear validation error if it exists
        this.clearFieldError(field);
    }
    renderCurrentStep() {
        // Hide all steps
        for (let i = 1; i <= this.totalSteps; i++) {
            const stepElement = document.getElementById(`step${i}`);
            if (stepElement) {
                stepElement.style.display = "none";
            }
        }
        // Show current step
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        if (currentStepElement) {
            currentStepElement.style.display = "block";
        }
        // Update button visibility
        const backBtn = document.getElementById("backBtn");
        const nextBtn = document.getElementById("nextBtn");
        const submitBtn = document.getElementById("submitBtn");
        if (backBtn)
            backBtn.style.display = this.currentStep === 1 ? "none" : "inline-block";
        if (nextBtn)
            nextBtn.style.display =
                this.currentStep === this.totalSteps ? "none" : "inline-block";
        if (submitBtn)
            submitBtn.style.display =
                this.currentStep === this.totalSteps ? "inline-block" : "none";
        // Populate form fields with saved data
        this.populateFormFields();
        // If at summary step, render the summary
        if (this.currentStep === this.totalSteps) {
            this.renderSummary();
        }
    }
    populateFormFields() {
        // Populate all inputs with saved form data
        Object.entries(this.formData).forEach(([field, value]) => {
            const input = document.querySelector(`[name="${field}"]`);
            if (input) {
                if (input.type === "radio") {
                    const radio = document.querySelector(`[name="${field}"][value="${value}"]`);
                    if (radio)
                        radio.checked = true;
                }
                else {
                    input.value = value;
                }
            }
        });
    }
    updateProgressIndicator() {
        // Update the progress indicator
        const indicators = document.querySelectorAll(".step-indicator");
        indicators.forEach((indicator, index) => {
            if (index + 1 < this.currentStep) {
                indicator.classList.add("completed");
                indicator.classList.remove("active");
            }
            else if (index + 1 === this.currentStep) {
                indicator.classList.add("active");
                indicator.classList.remove("completed");
            }
            else {
                indicator.classList.remove("active", "completed");
            }
        });
    }
    validateCurrentStep() {
        const errors = {};
        // Validation for Step 1
        if (this.currentStep === 1) {
            if (!this.formData.name.trim()) {
                errors.name = "Name is required";
            }
            if (!this.formData.dob) {
                errors.dob = "Date of Birth is required";
            }
            else {
                // Check if date is valid and not in the future
                const dobDate = new Date(this.formData.dob);
                const today = new Date();
                if (isNaN(dobDate.getTime()) || dobDate > today) {
                    errors.dob = "Please enter a valid date in the past";
                }
            }
            if (!this.formData.gender) {
                errors.gender = "Please select a gender";
            }
        }
        // Validation for Step 2
        if (this.currentStep === 2) {
            if (!this.formData.email.trim()) {
                errors.email = "Email is required";
            }
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
                errors.email = "Please enter a valid email address";
            }
            if (!this.formData.phone.trim()) {
                errors.phone = "Phone number is required";
            }
            else if (!/^\+?[0-9]{10,15}$/.test(this.formData.phone.replace(/[\s-]/g, ""))) {
                errors.phone = "Please enter a valid phone number";
            }
            if (!this.formData.address.trim()) {
                errors.address = "Address is required";
            }
        }
        return errors;
    }
    displayValidationErrors(errors) {
        // Clear all existing error messages first
        document.querySelectorAll(".error-message").forEach((el) => {
            el.textContent = "";
            el.classList.remove("visible");
        });
        // Display new error messages
        Object.entries(errors).forEach(([field, message]) => {
            const errorElement = document.getElementById(`${field}Error`);
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.add("visible");
                // Also add error class to the input
                const input = document.querySelector(`[name="${field}"]`);
                if (input) {
                    input.classList.add("error-input");
                }
            }
        });
    }
    clearFieldError(field) {
        const errorElement = document.getElementById(`${field}Error`);
        if (errorElement) {
            errorElement.textContent = "";
            errorElement.classList.remove("visible");
            // Remove error class from input
            const input = document.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.remove("error-input");
            }
        }
    }
    nextStep() {
        console.log("Next Step");
        const errors = this.validateCurrentStep();
        if (Object.keys(errors).length === 0) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.renderCurrentStep();
                this.updateProgressIndicator();
            }
        }
        else {
            this.displayValidationErrors(errors);
        }
    }
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.renderCurrentStep();
            this.updateProgressIndicator();
        }
    }
    renderSummary() {
        const summaryContainer = document.getElementById("summary");
        if (!summaryContainer)
            return;
        // Clear existing summary
        summaryContainer.innerHTML = "";
        // Create basic details section
        const basicDetails = document.createElement("div");
        basicDetails.className = "summary-section";
        basicDetails.innerHTML = `
      <h3>Basic Details</h3>
      <p><strong>Name:</strong> ${this.formData.name}</p>
      <p><strong>Date of Birth:</strong> ${this.formData.dob}</p>
      <p><strong>Gender:</strong> ${this.formData.gender}</p>
      <button type="button" class="edit-btn" data-step="1">Edit</button>
    `;
        // Create contact details section
        const contactDetails = document.createElement("div");
        contactDetails.className = "summary-section";
        contactDetails.innerHTML = `
      <h3>Contact Information</h3>
      <p><strong>Email:</strong> ${this.formData.email}</p>
      <p><strong>Phone:</strong> ${this.formData.phone}</p>
      <p><strong>Address:</strong> ${this.formData.address}</p>
      <button type="button" class="edit-btn" data-step="2">Edit</button>
    `;
        // Add sections to summary container
        summaryContainer.appendChild(basicDetails);
        summaryContainer.appendChild(contactDetails);
        // Add event listeners to edit buttons
        document.querySelectorAll(".edit-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const target = e.target;
                const step = parseInt(target.getAttribute("data-step") || "1");
                this.currentStep = step;
                this.renderCurrentStep();
                this.updateProgressIndicator();
            });
        });
    }
    submitForm() {
        // In a real application, this would send data to a server
        alert("Form submitted successfully!\n\n" +
            JSON.stringify(this.formData, null, 2));
        // Clear localStorage and reset form
        localStorage.removeItem(this.storageKey);
        // Reset form data
        this.formData = {
            name: "",
            dob: "",
            gender: "",
            email: "",
            phone: "",
            address: "",
        };
        // Reset to first step
        this.currentStep = 1;
        this.renderCurrentStep();
        this.updateProgressIndicator();
    }
}
// Initialize the form when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new MultiStepForm();
});
console.log("Hello");
//# sourceMappingURL=app.js.map