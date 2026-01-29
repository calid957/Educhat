# Immersive Real-Time Website

A fully immersive real-time website with comprehensive admin panel, chat functionality, and advanced user management system.

## 🚀 Features

### Core Functionality
- **Real-Time Communication** - WebSocket-based messaging with localStorage fallback
- **Immersive UI** - Modern glass morphism design with particle effects
- **Multi-Role System** - Student, Teacher, Moderator, and Admin roles
- **Advanced Admin Panel** - Complete site management and customization

### Authentication System
- **Secure Login/Signup** - Email/password authentication with validation
- **Role-Based Access** - Different interfaces for different user types
- **Password Management** - Forgot password and reset functionality
- **Session Management** - Persistent login with remember me option

### Chat System
- **Real-Time Messaging** - Instant messaging with typing indicators
- **User Presence** - Online/offline status tracking
- **Private & Group Chats** - Multiple chat channels support
- **Message History** - Persistent chat storage
- **Rich Notifications** - Desktop and in-app notifications

### Admin Panel Features
- **User Management** - Complete user CRUD operations
- **Ban System** - Automated and manual ban management
- **Violation Tracking** - Content moderation and violation logs
- **Site Settings** - Comprehensive admin settings:
  - Maintenance mode toggle
  - Theme & UI customization
  - Logo & background management
  - Date/time format settings
  - Email template management
  - Push notification settings
  - File upload limits
  - Cache management
  - Terms of service management

### UI/UX Features
- **Responsive Design** - Works on all device sizes
- **Immersive Effects** - Particle backgrounds, glass morphism, animations
- **Dark Theme** - Modern dark interface with accent colors
- **Interactive Elements** - Hover effects, magnetic buttons, ripple effects
- **Accessibility** - Keyboard navigation and screen reader support

## 📁 Project Structure

```
V2/
├── index.html              # Main landing page with login/signup
├── chat.html               # Chat interface
├── admin.html              # Admin dashboard
├── moderator.html          # Moderator panel
├── immersive.css           # Immersive styling and animations
├── immersive.js            # Immersive effects and interactions
├── realtime.js             # Real-time communication manager
├── script.js               # Main application logic
├── chat.js                 # Chat functionality
├── admin.js                # Admin panel logic
├── admin-settings.js       # Admin settings management
├── modals.js               # Modal system
├── package.json            # Project metadata and scripts
├── test-admin-settings.html # Settings testing page
├── .gitignore              # Git ignore file
└── README.md               # This documentation
```

## 🛠️ Local Development

### Prerequisites
- Python 3.x installed (for local server)
- Modern web browser

### Setup Instructions

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd V2
   ```

2. **Start local development server**
   ```bash
   npm start
   # or
   python -m http.server 8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

### Development Commands

```bash
# Start local development server
npm start

# Alternative start command
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## 🔧 Configuration

### Environment Setup
1. Configure any environment-specific settings in `realtime.js`
2. Customize user roles and permissions in `script.js`
3. Update admin settings in `admin-settings.js`

### Customization
- **Theme**: Modify `immersive.css` for visual changes
- **Real-Time Settings**: Update `realtime.js` for WebSocket configuration
- **Admin Settings**: Customize `admin-settings.js` for additional admin features
- **User Roles**: Modify role-based access in `script.js`

## 🌐 Features Overview

### Real-Time Communication
- WebSocket connections with localStorage fallback
- Live user presence and status updates
- Typing indicators and read receipts
- Message history and search functionality

### Admin Management
- Complete user management with search and filtering
- Advanced ban system with automated violations
- Comprehensive site settings and customization
- Real-time monitoring and analytics

### User Experience
- Immersive particle effects and animations
- Glass morphism design with blur effects
- Responsive layout for all devices
- Accessibility features and keyboard navigation

## 🔒 Security Features

- Input validation and sanitization
- XSS protection headers
- File upload validation
- Role-based access control
- Secure session management

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Android Chrome)

## 🚀 Performance

- Optimized asset loading
- Efficient DOM manipulation
- Lazy loading for large datasets
- Service worker ready for PWA
- Minimal bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the package.json file for details.

## 🆘 Support

For issues and questions:
1. Check the existing documentation
2. Test with the provided test pages
3. Review browser console for errors
4. Ensure all files are uploaded correctly to Firebase

---

**Note**: This is a frontend demonstration. For production use, implement proper backend authentication, database integration, and security measures.
