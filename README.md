# Drawing Board with Google Authentication

A modern web-based drawing application with Google OAuth authentication.

## Features

- **Google Authentication**: Secure sign-in with Google account
- **Drawing Tools**: Brush and eraser with adjustable sizes
- **Color Selection**: Color picker with preset colors
- **Canvas Actions**: Clear canvas and download artwork
- **Responsive Design**: Works on desktop and mobile devices
- **Session Management**: Persistent login state using localStorage

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create a new "OAuth 2.0 Client ID"
5. Select "Web application" as the application type
6. Add your development URL (e.g., `http://localhost:8000`) to authorized JavaScript origins
7. Add your redirect URI (e.g., `http://localhost:8000`) to authorized redirect URIs
8. Copy the Client ID

### 2. Update Client ID

Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` in both files:

- In `index.html` (line 9):
  ```html
  <meta name="google-signin-client_id" content="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com">
  ```

- In `script.js` (line 28):
  ```javascript
  client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  ```

### 3. Run the Application

```bash
# Navigate to the project directory
cd c:/Users/umesh/Downloads/project/todo

# Start a local server
python -m http.server 8000

# Open your browser and navigate to
http://localhost:8000
```

## Usage

1. **Sign In**: Click "Sign in with Google" to authenticate
2. **Draw**: Use the brush tool to draw on the canvas
3. **Erase**: Switch to eraser tool or right-click for quick erasing
4. **Colors**: Choose from color picker or preset colors
5. **Brush Size**: Adjust brush size with the slider
6. **Save**: Download your artwork as PNG
7. **Sign Out**: Click the sign out button in the user profile

## Security Features

- JWT token validation
- Secure session management
- Protected drawing features
- Automatic sign-out on token expiration

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Mobile Support

- Touch-enabled drawing
- Responsive design
- Mobile-optimized UI
