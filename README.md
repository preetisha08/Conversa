# 💬 Conversa

A full-stack real-time chat application built with the MERN stack and Socket.IO. Conversa enables users to communicate through private and group conversations with real-time messaging, typing indicators, online presence, unread message tracking, and read receipts.

## 🌐 Live Demo

**Live Application:** https://conversa-h41g.onrender.com

**GitHub Repository:** https://github.com/preetisha08/Conversa

> The backend is hosted on Render's free tier, so the first request may take a short time if the service is inactive.

## ✨ Features

- Secure user registration and login
- JWT-based authentication and protected routes
- Search users and start private conversations
- Real-time one-to-one messaging with Socket.IO
- Group chat creation and messaging
- Real-time online and offline presence
- Live typing indicators
- Persistent message history with MongoDB
- Persistent unread message counts
- Real-time Sent and Seen read receipts
- Conversation ordering by latest activity
- Responsive desktop and mobile interface
- Mobile conversation-to-chat navigation
- Secure environment variable configuration
- Fully deployed frontend and backend

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- Axios
- React Router
- Socket.IO Client
- React Icons

### Backend

- Node.js
- Express.js
- Socket.IO
- JWT Authentication
- bcryptjs

### Database

- MongoDB
- Mongoose

### Deployment

- Render
- GitHub

## 🏗️ Architecture

Conversa follows a client-server architecture:

1. The React frontend handles authentication, conversation management, and the responsive user interface.
2. Axios communicates with REST APIs for users, chats, messages, unread counts, and read-state persistence.
3. The Express backend handles authentication and application logic.
4. MongoDB stores users, chats, messages, unread state, and read receipts.
5. Socket.IO provides real-time messaging, typing indicators, online presence, and live read-receipt updates.

## 📁 Project Structure

```text
Conversa/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🔐 Authentication Flow

1. A user registers or logs in.
2. The backend validates the credentials.
3. A JWT is generated and returned to the frontend.
4. The token is stored locally and attached to protected API requests.
5. Protected backend routes verify the token before allowing access.

## ⚡ Real-Time Communication

Socket.IO powers:

- Instant message delivery
- Online user presence
- Typing indicators
- Real-time read-receipt updates

Each authenticated user joins a personal Socket.IO room. Events are delivered to the appropriate users while persistent data is stored in MongoDB.

## 📖 Read Receipts and Unread Messages

Each message contains a `readBy` field.

This allows Conversa to:

- Persist unread message counts across refreshes
- Clear unread counts when a conversation is opened
- Display Sent or Seen for private messages
- Update read status in real time

## 📱 Responsive Design

On desktop, Conversa displays the conversation sidebar and active chat together.

On mobile:

1. The conversation list appears first.
2. Selecting a conversation opens the chat in full-screen mode.
3. A back button returns the user to the conversation list.

## 🚀 Run Locally

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- A MongoDB Atlas account or MongoDB connection string

### 1. Clone the Repository

```bash
git clone https://github.com/preetisha08/Conversa.git
cd Conversa
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Start the backend:

```bash
npm run dev
```

### 3. Install Frontend Dependencies

Open another terminal and run:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL shown by Vite in your browser.

## 📸 Screenshots

Screenshots of the authentication pages, desktop chat interface, real-time messaging, group chats, unread badges, read receipts, and mobile interface will be added here.

## 🔮 Future Improvements

- Image and file sharing
- User profile customization
- Push notifications
- Message reactions
- Voice and video calling

## 👩‍💻 Author

**Preetisha Purkayastha**

- GitHub: https://github.com/preetisha08
- LinkedIn: https://www.linkedin.com/in/preetisha-purkayastha-159882352

---

If you found this project useful, consider giving the repository a ⭐.
