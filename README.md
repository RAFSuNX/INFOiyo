# INFOiyo - A Modern Blogging Platform

INFOiyo is a feature-rich blogging platform built with React, TypeScript, Firebase, and TailwindCSS. It provides a seamless experience for writers and readers to share and engage with content.

## Features

### User Management
- Email-based authentication
- Unique usernames
- Role-based access control (User, Writer, Admin)
- Profile management with customizable avatars
- Email verification system

### Content Management
- Markdown-based post creation
- Real-time post preview
- Featured images support
- SEO-optimized content
- Post status workflow (Draft, Pending, Published)
- Post slugs for SEO-friendly URLs

### Writer Program
- Writer application system
- Admin review process
- Content moderation
- Post approval workflow

### Community Features
- Real-time chat
- Post comments
- Content reporting system
- User moderation tools

### Admin Dashboard
- User management
- Content moderation
- Writer application review
- Report handling
- Analytics overview

## Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Cloud Storage
- **Routing**: React Router v6
- **Markdown**: react-markdown with remark-gfm
- **Icons**: Lucide React
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/        # Reusable UI components
├── contexts/         # React context providers
├── hooks/           # Custom React hooks
├── lib/             # Firebase and other configurations
├── pages/           # Page components
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase project and obtain configuration

4. Create a `.env` file with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

5. Set up Firebase indexes (see firebase-indexes.txt)

6. Start the development server:
   ```bash
   npm run dev
   ```

## Firebase Setup

### Required Indexes
See `firebase-indexes.txt` for a complete list of required indexes. Key collections:

- `posts`: For post queries and unique slugs
- `users`: For user management and unique usernames
- `writer_applications`: For managing writer applications
- `reports`: For content moderation
- `chat`: For real-time messaging

### Security Rules
Implement proper security rules for:
- User data access
- Post creation and editing
- Comment permissions
- Chat access
- Report submission

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Follow TailwindCSS class ordering
- Use proper TypeScript types

## Features in Detail

### Post Creation
- Rich text editing with Markdown
- Real-time preview
- Image URL support
- SEO metadata
- Auto-generated slugs

### User Roles

1. **User**
   - Can read posts
   - Can comment
   - Can participate in chat
   - Can apply to become a writer

2. **Writer**
   - All user permissions
   - Can create posts
   - Posts require approval (if not admin)

3. **Admin**
   - All writer permissions
   - Can approve/reject posts
   - Can manage users
   - Can handle reports
   - Can approve writer applications

### Security Features
- Email verification
- Rate limiting
- Content moderation
- User banning system
- Report handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Lucide Icons](https://lucide.dev/)