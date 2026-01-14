// Login Modal Script
document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeModal = document.getElementById('closeModal');

    if (loginBtn && loginModal && closeModal) {
        // Open modal
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'flex';
        });

        // Close modal when clicking X
        closeModal.addEventListener('click', function() {
            loginModal.style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }
});
