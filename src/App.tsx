import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import ViewPost from './pages/ViewPost';
import Profile from './pages/Profile';
import EditPost from './pages/EditPost';
import MarkdownGuide from './pages/MarkdownGuide';
import AdminUsers from './pages/AdminUsers';
import Chat from './pages/Chat';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-white">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/post/:id" element={<ViewPost />} />
              <Route path="/post/:id/edit" element={<EditPost />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/markdown-guide" element={<MarkdownGuide />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/chat" element={<Chat />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;