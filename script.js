class DrawingBoard {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'brush';
        this.currentColor = '#000000';
        this.currentSize = 5;
        this.isAuthenticated = false;
        this.currentUser = null;
        
        this.initializeAuth();
        this.initializeCanvas();
        this.setupEventListeners();
        this.setupToolListeners();
        this.setupColorListeners();
        this.setupSizeListeners();
        this.setupActionListeners();
    }

    initializeAuth() {
        // Check if user is already signed in
        this.checkAuthState();
        
        // Initialize Google Sign-In
        window.onload = () => {
            google.accounts.id.initialize({
                client_id: '147659911046-38fji05f1uu7harc6gs7hrh632ia6sgh.apps.googleusercontent.com',
                callback: this.handleGoogleSignIn.bind(this),
                auto_select: false,
                cancel_on_tap_outside: true
            });

            // Render the Google Sign-In button
            google.accounts.id.renderButton(
                document.getElementById('googleSignInBtn'),
                {
                    theme: 'filled_blue',
                    size: 'large',
                    text: 'signin_with',
                    shape: 'rectangular',
                    logo_alignment: 'left'
                }
            );

            // Display the One Tap dialog
            google.accounts.id.prompt();
        };
    }

    checkAuthState() {
        const savedUser = localStorage.getItem('drawingBoardUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.isAuthenticated = true;
            this.showAuthenticatedUI();
        } else {
            this.showAuthOverlay();
        }
    }

    handleGoogleSignIn(response) {
        const payload = this.decodeJWT(response.credential);
        
        this.currentUser = {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            avatar: payload.picture
        };
        
        this.isAuthenticated = true;
        localStorage.setItem('drawingBoardUser', JSON.stringify(this.currentUser));
        
        this.showAuthenticatedUI();
        this.hideAuthOverlay();
    }

    decodeJWT(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    }

    showAuthenticatedUI() {
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        const signOutBtn = document.getElementById('signOutBtn');
        
        userName.textContent = this.currentUser.name;
        userAvatar.src = this.currentUser.avatar;
        userProfile.classList.remove('hidden');
        
        signOutBtn.addEventListener('click', () => {
            this.signOut();
        });
        
        // Enable drawing features
        this.enableDrawingFeatures();
    }

    hideAuthOverlay() {
        const authOverlay = document.getElementById('authOverlay');
        authOverlay.style.display = 'none';
    }

    showAuthOverlay() {
        const authOverlay = document.getElementById('authOverlay');
        authOverlay.style.display = 'flex';
        this.disableDrawingFeatures();
    }

    signOut() {
        // Clear local storage
        localStorage.removeItem('drawingBoardUser');
        
        // Reset user state
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Hide user profile
        document.getElementById('userProfile').classList.add('hidden');
        
        // Show auth overlay
        this.showAuthOverlay();
        
        // Sign out from Google
        google.accounts.id.disableAutoSelect();
    }

    enableDrawingFeatures() {
        // Enable all drawing tools
        const tools = document.querySelectorAll('.tool-btn, #colorPicker, #brushSize, #clearCanvas, #downloadCanvas');
        tools.forEach(tool => {
            tool.disabled = false;
            tool.style.opacity = '1';
        });
        
        // Enable canvas
        this.canvas.style.pointerEvents = 'auto';
        this.canvas.style.opacity = '1';
    }

    disableDrawingFeatures() {
        // Disable all drawing tools
        const tools = document.querySelectorAll('.tool-btn, #colorPicker, #brushSize, #clearCanvas, #downloadCanvas');
        tools.forEach(tool => {
            tool.disabled = true;
            tool.style.opacity = '0.5';
        });
        
        // Disable canvas
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.opacity = '0.3';
    }

    initializeCanvas() {
        // Set canvas background
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set initial drawing properties
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setupToolListeners() {
        const brushTool = document.getElementById('brushTool');
        const eraserTool = document.getElementById('eraserTool');
        
        brushTool.addEventListener('click', () => {
            this.currentTool = 'brush';
            this.updateToolButtons();
            this.canvas.style.cursor = 'crosshair';
        });
        
        eraserTool.addEventListener('click', () => {
            this.currentTool = 'eraser';
            this.updateToolButtons();
            this.canvas.style.cursor = 'grab';
        });
    }

    setupColorListeners() {
        const colorPicker = document.getElementById('colorPicker');
        const colorButtons = document.querySelectorAll('[data-color]');
        
        colorPicker.addEventListener('change', (e) => {
            this.currentColor = e.target.value;
            this.updateSizePreview();
        });
        
        colorButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.currentColor = button.dataset.color;
                colorPicker.value = this.currentColor;
                this.updateSizePreview();
            });
        });
    }

    setupSizeListeners() {
        const brushSize = document.getElementById('brushSize');
        const sizeValue = document.getElementById('sizeValue');
        
        brushSize.addEventListener('input', (e) => {
            this.currentSize = e.target.value;
            sizeValue.textContent = this.currentSize;
            this.updateSizePreview();
        });
    }

    setupActionListeners() {
        document.getElementById('clearCanvas').addEventListener('click', () => {
            this.clearCanvas();
        });
        
        document.getElementById('downloadCanvas').addEventListener('click', () => {
            this.downloadCanvas();
        });
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        
        // Right click for quick eraser
        if (e.button === 2) {
            this.currentTool = 'eraser';
            this.updateToolButtons();
        }
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.lineWidth = this.currentSize;
        
        if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = this.currentColor;
        }
        
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.ctx.beginPath();
            
            // Reset tool if it was temporarily changed by right-click
            const eraserTool = document.getElementById('eraserTool');
            if (!eraserTool.classList.contains('active')) {
                this.currentTool = 'brush';
                this.updateToolButtons();
            }
        }
    }

    handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                             e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    updateToolButtons() {
        const brushTool = document.getElementById('brushTool');
        const eraserTool = document.getElementById('eraserTool');
        
        brushTool.classList.toggle('active', this.currentTool === 'brush');
        eraserTool.classList.toggle('active', this.currentTool === 'eraser');
    }

    updateSizePreview() {
        const sizePreview = document.getElementById('sizePreview');
        sizePreview.style.width = this.currentSize + 'px';
        sizePreview.style.height = this.currentSize + 'px';
        sizePreview.style.backgroundColor = this.currentColor;
    }

    clearCanvas() {
        if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    downloadCanvas() {
        const link = document.createElement('a');
        link.download = `drawing-${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }
}

// Initialize the drawing board when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DrawingBoard();
});
