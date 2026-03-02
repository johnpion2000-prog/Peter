// Step management
const steps = ['Amount', 'Recipient', 'Payment', 'Proof', 'Complete'];
let currentStep = 0;

function nextStep() {
    if (currentStep < steps.length - 1) {
        currentStep++;
        updateUI();
    }
}

function updateUI() {
    // Update progress indicator
    document.querySelectorAll('.step').forEach((el, index) => {
        if (index <= currentStep) {
            el.classList.add('active');
        }
    });
    
    // Show current step content
    document.querySelectorAll('.step-content').forEach((el, index) => {
        el.style.display = index === currentStep ? 'block' : 'none';
    });
}