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
import ApplyWriter from './pages/ApplyWriter';
import Chat from './pages/Chat';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={
            <div className="min-h-screen bg-white overflow-x-hidden animate-fade-in">
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 animate-slide-in">
                <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/post/:slug" element={<ViewPost />} />
              <Route path="/post/:slug/edit" element={<EditPost />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/markdown-guide" element={<MarkdownGuide />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/apply-writer" element={<ApplyWriter />} />
                </Routes>
              </main>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;