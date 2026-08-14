# 💬 Echo-room (Horizontally scaled using Redis Pub/Sub, with AI-powered conversation search)
## (MERN, Redis(pub/sub), Docker-compose, Socket.io, Typescript, Zustand, Shadcn(UI), Python, FastAPI, Ollama, RAG)

### Real-Time Messaging Platform with AI-Powered Conversation Search

A powerful, feature-rich real-time messaging platform built with the MERN stack and TypeScript. Echo-room delivers seamless communication with advanced group chat capabilities, comprehensive file sharing, and cross-platform compatibility.

[![GitHub Stars](https://img.shields.io/github/stars/labhanshu03/Echo-room?style=social)](https://github.com/labhanshu03/Echo-room)
[![GitHub Forks](https://img.shields.io/github/forks/labhanshu03/Echo-room?style=social)](https://github.com/labhanshu03/Echo-room/fork)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

---

## ✨ Features

### 🤖 AI-Powered Conversation Search (RAG)
- **Ask questions about your own chat history** — "when does the trip start?", "who's bringing what?" — answered from real, past conversations, not guesses
- **Scoped per conversation** — answers are drawn only from the specific DM/channel being asked about, never leaked across conversations
- **Recency-aware answers** — if a decision changed later in the conversation, the most recent message wins
- **Handles topic drift automatically** — a burst of messages covering multiple unrelated subjects (e.g. dinner plans + a sports update + a reminder) is detected and split so each subject is independently searchable
- **Same topic, resumed weeks later** — conversations picked back up after a long gap are linked to the original topic thread instead of starting over
- **Fully self-hosted** — local embeddings ([`all-MiniLM-L6-v2`](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)) and a local LLM ([Ollama](https://ollama.com/)), no external AI API required
- Backed by a small evaluation harness (24 test cases, including negative and cross-conversation-isolation checks) so retrieval quality is measured, not assumed — see [`docs/rag-architecture.html`](docs/rag-architecture.html) for the full design writeup

### 💬 Real-Time Communication
- **Instant Messaging**: Lightning-fast message delivery using WebSocket technology
- **Real-Time Updates**: Messages appear instantly for all participants
- **Live Synchronization**: All group members see updates in real-time
- **Seamless Experience**: No page refresh needed for new messages

### 👥 Group Chat
- Create and manage unlimited group chats
- Add or remove members dynamically
- Real-time group message delivery
- Custom group names and avatars
- Multiple participants in a single conversation

### 📁 File Sharing
- **Universal File Support**: Share any file type (documents, videos, audio, etc.)
- **Image Sharing**: Optimized image upload and preview
- **Download Management**: Easy file download and viewing

### 🎨 Rich Messaging Experience
- **Emoji Support**: Express yourself with a full emoji picker
- **Rich Text Messages**: Send formatted text messages
- **Message History**: Access complete conversation history
- **User-Friendly Interface**: Clean and intuitive chat design

### 🔐 Security & Authentication
- Secure user authentication with JWT
- Password encryption with bcrypt
- Protected routes and API endpoints
- Session management
- CORS configuration

### 📱 Cross-Platform Compatibility
- Responsive design for mobile, tablet, and desktop
- Progressive Web App (PWA) capabilities
- Consistent experience across all devices
- Touch-optimized interface

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher)
- **npm** 
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/labhanshu03/Echo-room.git
   cd Echo-room
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Set up the RAG service (Python)**
   ```bash
   cd rag-service
   python -m venv venv
   .\venv\Scripts\Activate.ps1   # Windows; use `source venv/bin/activate` on macOS/Linux
   pip install -r requirements.txt
   ```

5. **Install and start Ollama**

   Download from [ollama.com](https://ollama.com/), then pull the model used for summaries/answers:
   ```bash
   ollama pull llama3.1
   ```
   Ollama runs as a background service after install — no separate `ollama serve` needed unless it isn't already running.

6. **Set up environment variables**

   Create a `.env` file in the `backend` directory:
   ```env
   PORT=8000
   JWT_KEY=YOUR_JWT_KEY
   ORIGIN="http://localhost:5173"
   DATABASE_URL=MONGODB_ATLAS_URL
   CLOUDINARY_CLOUD_NAME=CLOUDINARY_CLOUD_NAME
   CLOUDINARY_API_KEY=CLOUDINARY_API_KEY
   CLOUDINARY_API_SECRET=CLOUDINARY_API_SECRET
   GEMINI_API_KEY=GEMINI_API_KEY
   REDIS_HOST=YOUR_REDIS_HOST
   REDIS_PORT=YOUR_REDIS_PORT
   REDIS_PASSWORD=YOUR_REDIS_PASSWORD
   RAG_SERVICE_URL=http://127.0.0.1:8001
   INTERNAL_JWT_SECRET=A_DIFFERENT_RANDOM_SECRET_FROM_JWT_KEY
   ```

   Create a `.env` file in the `rag-service` directory:
   ```env
   MONGO_URI=MONGODB_ATLAS_URL
   INTERNAL_JWT_SECRET=SAME_VALUE_AS_BACKEND_ENV
   OLLAMA_BASE_URL=http://127.0.0.1:11434
   OLLAMA_MODEL=llama3.1
   ```

   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_SERVER_URL="http://localhost:8000"
   ```

7. **Configure MongoDB Atlas Vector Search**

   The RAG feature needs two vector search indexes on your Atlas cluster — `chunks_vector_index` (on the `chunks.embedding` field) and `topics_vector_index` (on `topics.centroidEmbedding`), each with `participants` and `conversationKey` as filter fields. See [`docs/rag-architecture.html`](docs/rag-architecture.html) for the exact index definitions.

8. **Run the application**

   Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

   In a new terminal, start the chunk-processing worker:
   ```bash
   cd backend
   npm run worker
   ```

   In a new terminal, start the RAG service:
   ```bash
   cd rag-service
   .\venv\Scripts\Activate.ps1
   uvicorn app.main:app --reload --port 8001
   ```

   In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

9. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000`
   - RAG service: `http://localhost:8001`

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Socket.io-client** - Real-time bidirectional communication
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing
- **CSS3/SASS** - Modern styling
- **Material-UI / Tailwind CSS** - UI components

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe backend development
- **Socket.io** - WebSocket implementation
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Cloud storage for media files
- **BullMQ + Redis** - Async job queue for debounced chunk processing

### AI / RAG Service (Python)
- **FastAPI** - Async Python web framework serving the RAG endpoints
- **sentence-transformers (`all-MiniLM-L6-v2`)** - Local, self-hosted embedding model
- **Ollama (Llama 3.1)** - Local LLM for topic summarization and answer generation
- **MongoDB Atlas Vector Search** - Vector similarity search over conversation topics/chunks
- **Motor** - Async MongoDB driver for Python
- **PyJWT** - Verifies short-lived internal service-to-service tokens signed by the Node backend

---

## 📁 Project Structure

```
Echo-room/
├── frontend/                   # Frontend application
│   ├── public/                # Static files
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Chat/         # Chat interface components
│   │   │   ├── Groups/       # Group management components
│   │   │   ├── Auth/         # Authentication components
│   │   │   └── Shared/       # Shared components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── contexts/         # React context providers
│   │   ├── services/         # API service functions
│   │   ├── utils/            # Utility functions
│   │   ├── types/            # TypeScript type definitions
│   │   ├── assets/           # Images, fonts, etc.
│   │   └── App.tsx           # Root component
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                   # Backend application
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   ├── sockets/          # Socket.io event handlers
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utility functions
│   │   ├── types/            # TypeScript interfaces
│   │   └── server.ts         # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── rag-service/                # Python RAG microservice
│   ├── app/
│   │   ├── main.py            # FastAPI app: /process-chunk, /query endpoints
│   │   ├── config.py          # Env var loading
│   │   ├── db.py               # Motor (async Mongo) client
│   │   ├── auth.py             # Internal JWT verification
│   │   └── services/
│   │       ├── embedding.py    # all-MiniLM-L6-v2 wrapper
│   │       ├── segmentation.py # LLM pass to split multi-subject chunks
│   │       ├── topic_matching.py # Cosine-similarity topic linking
│   │       ├── retrieval.py    # Shared retrieval logic (used by /query and eval)
│   │       └── llm.py          # Ollama API calls
│   ├── eval/                   # Evaluation harness
│   │   ├── discover_topics.py  # List real topics from the database
│   │   ├── discover_chunks.py  # Inspect raw messages behind a topic
│   │   ├── test_cases.json     # Hand-written (question -> expected topic) pairs
│   │   └── run_eval.py         # Scores retrieval against test_cases.json
│   ├── requirements.txt
│   └── Dockerfile
│
├── docs/
│   └── rag-architecture.html   # Full RAG design writeup and interview reference
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🔧 Configuration

### File Upload Settings

Adjust file size limits in `backend/.env`:
```env
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

### Socket.io Configuration

Configure CORS and connection settings in `backend/src/config/socket.ts`

### Database Configuration

MongoDB connection settings in `backend/src/config/database.ts`

---

## 📱 Features in Detail

### Real-Time Messaging
```typescript
// Messages are delivered instantly using WebSocket
socket.on('send_message', (message) => {
  // Message is broadcast to all participants
  io.to(roomId).emit('receive_message', message);
});
```

### Group Management
- Create groups with custom names and avatars
- Add multiple users to groups
- Leave or delete groups

### File Handling
- Supports multiple file types: images, videos, documents, audio
- File preview for images and videos
- Progress indicators during upload
- Secure file storage with Cloudinary

---

## 🎯 API Endpoints

### Authentication
```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login user
GET    /api/auth/me            # Get current user
POST   /api/auth/logout        # Logout user
```

### Users
```
GET    /api/users              # Get all users
GET    /api/users/:id          # Get user by ID
PUT    /api/users/:id          # Update user profile
```

### Messages
```
GET    /api/messages/:chatId   # Get messages for a chat
POST   /api/messages           # Send a message
PUT    /api/messages/:id       # Edit a message
DELETE /api/messages/:id       # Delete a message
POST   /api/messages/ask       # Ask a question about a conversation's history (RAG)
```

### Chats
```
GET    /api/chats              # Get all user chats
POST   /api/chats              # Create new chat
GET    /api/chats/:id          # Get chat by ID
PUT    /api/chats/:id          # Update chat
DELETE /api/chats/:id          # Delete chat
```

### Groups
```
POST   /api/groups             # Create new group
PUT    /api/groups/:id/add     # Add member to group
PUT    /api/groups/:id/remove  # Remove member from group
PUT    /api/groups/:id         # Update group details
DELETE /api/groups/:id         # Delete group
```

### Files
```
POST   /api/upload             # Upload file
GET    /api/files/:id          # Get file
DELETE /api/files/:id          # Delete file
```

---

## 🔐 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: API endpoints are rate-limited to prevent abuse
- **CORS Protection**: Configured CORS policy
- **XSS Protection**: Protected against cross-site scripting
- **SQL Injection Prevention**: Using Mongoose ORM

---

## 🚀 Deployment

### Frontend Deployment (Render)

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `build` folder to your hosting platform

### Backend Deployment (Heroku/Railway/Render)

1. Ensure all environment variables are set
2. Push to your hosting platform
3. The platform will automatically detect and build the Node.js app

### Environment Variables for Production

Update your environment variables for production:
- Set `NODE_ENV=production`
- Use production database URL
- Update `CLIENT_URL` to your frontend domain
- Use strong JWT secrets

---

## 🎨 Customization

### Branding
- Replace logo in `frontend/public/logo.png`
- Update app name in `package.json`
- Modify favicon in `frontend/public/`

---


## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct.

---

## 🐛 Known Issues

- File upload may be slow for large files on slower connections
- Ensure stable internet connection for optimal real-time performance
- The local embedding model (`all-MiniLM-L6-v2`) shows weaker topic-relevance separation on short, casual chat text than a hosted embedding model would — measured via the evaluation harness (21/24 test cases passing). See [`docs/rag-architecture.html`](docs/rag-architecture.html) for the full analysis.

---

## 🗺️ Roadmap

- [ ] Voice and video calling
- [ ] Message encryption (end-to-end)
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Online/offline status indicators
- [ ] Message editing and deletion
- [ ] Message reactions
- [ ] Message forwarding
- [ ] Custom themes and dark mode
- [ ] Mobile apps (React Native)
- [ ] Desktop apps (Electron)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Labhanshu**

- GitHub: [@labhanshu03](https://github.com/labhanshu03)
- Project Link: [https://github.com/labhanshu03/Echo-room](https://github.com/labhanshu03/Echo-room)

---

## 🙏 Acknowledgments

- Socket.io for real-time communication
- MongoDB for flexible data storage
- Cloudinary for media management
- React and TypeScript communities
- All open-source contributors

---

## 📞 Support

Need help? Here's how to reach us:

- 📧 Open an [Issue](https://github.com/labhanshu03/Echo-room/issues)
- 💬 GitHub Discussions
- 📖 Check the [Wiki](https://github.com/labhanshu03/Echo-room/wiki)

---

## ⭐ Show Your Support

If you find Echo-room useful, please consider giving it a ⭐️!

---

## 📸 Screenshots


---

<p align="center">
  <strong>Built with ❤️ for seamless communication</strong>
</p>

<p align="center">
  <sub>Echo-room - Where conversations come alive</sub>
</p>
