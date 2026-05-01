document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset message
        messageDiv.textContent = '';
        messageDiv.className = 'message';
        
        // Get form data
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Basic validation
        if (!email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        // Set loading state
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;

        try {
            // NOTE: Here is the actual API call logic ready for the backend.
            // Replace `https://api.example.com/v1/auth/login` with your real endpoint.
            
            const response = await fetch('http://api.example.com/v1/auth/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            if (response.ok) {
                showMessage('Login successful! Redirecting...', 'success');
                // Store auth token
                localStorage.setItem('authToken', data.token);
                // Redirect user
                window.location.href = '/dashboard';
            } else {
                showMessage(data.message || 'Invalid credentials', 'error');
            }
        
            // Simulating network request for demonstration
            const response = await simulateApiCall(email, password);
            
            if (response.ok) {
                showMessage('Login successful! Redirecting...', 'success');
            } else {
                showMessage(response.error || 'Invalid credentials', 'error');
            }
        } catch (error) {
            showMessage('Network error occurred during login. Please try again.', 'error');
            console.error('Login error:', error);
        } finally {
            // Reset button state
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
    }

    // Mock API function for demonstration
    function simulateApiCall(email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate success for demo user
                if (email === 'admin@example.com' && password === 'password') {
                    resolve({ ok: true, token: 'fake-jwt-token-123' });
                } else {
                    resolve({ ok: false, error: 'Invalid email or password' });
                }
            }, 1500);
        });
    }
});