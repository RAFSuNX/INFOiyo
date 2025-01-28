import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile, UserRole, PostStatus } from '../types/user';
import { Shield, UserX, UserCheck, Flag, Search, ChevronDown, PenLine } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import BackButton from '../components/BackButton';

interface Report {
  id: string;
  messageId: string;
  messageContent: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserEmail: string;
  reporterUserId: string;
  reporterUserName: string;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: any;
}

interface WriterApplication {
  id: string;
  userId: string;
  username: string;
  email: string;
  reason: string;
  experience: string;
  topics: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

const AVAILABLE_ROLES: UserRole[] = ['user', 'writer', 'admin'];

interface PendingPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: any;
  status: PostStatus;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [applications, setApplications] = useState<WriterApplication[]>([]);
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'posts' | 'applications'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const { userProfile } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const usersRef = collection(db, 'users');
      const reportsRef = collection(db, 'reports');
      const applicationsRef = collection(db, 'writer_applications');
      const postsRef = collection(db, 'posts');
      const reportsQuery = query(reportsRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
      const applicationsQuery = query(applicationsRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
      const postsQuery = query(postsRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));

      const [usersSnapshot, reportsSnapshot, applicationsSnapshot, postsSnapshot] = await Promise.all([
        getDocs(query(usersRef)),
        getDocs(reportsQuery),
        getDocs(applicationsQuery),
        getDocs(postsQuery)
      ]);

      const usersData = usersSnapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id,
      } as UserProfile));

      const reportsData = reportsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as Report));
      
      const applicationsData = applicationsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as WriterApplication));

      const postsData = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PendingPost));

      setUsers(usersData);
      setFilteredUsers(usersData);
      setReports(reportsData);
      setApplications(applicationsData);
      setPendingPosts(postsData);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const results = users.filter(user =>
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const handleToggleUserStatus = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    await updateDoc(doc(db, 'users', uid), {
      status: newStatus
    });
    setUsers(users.map(user => 
      user.uid === uid ? { ...user, status: newStatus } : user
    ));
    setFilteredUsers(filteredUsers.map(user => 
      user.uid === uid ? { ...user, status: newStatus } : user
    ));
  };

  const handleUpdateRole = async (uid: string, newRole: UserRole) => {
    if (!AVAILABLE_ROLES.includes(newRole)) {
      console.error('Invalid role selected');
      return;
    }

    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        role: newRole
      });

      const updatedUsers = users.map(user => 
        user.uid === uid ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(user =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      setUpdatingRole(null);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleResolveReport = async (reportId: string, reportedUserId: string) => {
    await updateDoc(doc(db, 'reports', reportId), {
      status: 'resolved'
    });
    setReports(reports.filter(report => report.id !== reportId));
  };

  const handlePostAction = async (postId: string, action: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        status: action
      });
      setPendingPosts(pendingPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error updating post status:', error);
    }
  };

  const handleApplicationAction = async (applicationId: string, userId: string, action: 'approved' | 'rejected') => {
    try {
      // Update application status
      await updateDoc(doc(db, 'writer_applications', applicationId), {
        status: action
      });

      // If approved, update user role to writer
      if (action === 'approved') {
        await updateDoc(doc(db, 'users', userId), {
          role: 'writer'
        });

        // Update local state
        setUsers(users.map(user => 
          user.uid === userId ? { ...user, role: 'writer' } : user
        ));
      }

      // Remove application from list
      setApplications(applications.filter(app => app.id !== applicationId));
    } catch (error) {
      console.error('Error handling application:', error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Unauthorized Access</h2>
        <p className="mt-2">You don't have permission to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton to="/" />
      </div>
      
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'users' ? 'bg-black text-white' : 'border border-black'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === 'reports' ? 'bg-black text-white' : 'border border-black'
          }`}
        >
          <Flag className="h-4 w-4" />
          Reports {reports.length > 0 && `(${reports.length})`}
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === 'posts' ? 'bg-black text-white' : 'border border-black'
          }`}
        >
          <PenLine className="h-4 w-4" />
          Pending Posts {pendingPosts.length > 0 && `(${pendingPosts.length})`}
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === 'applications' ? 'bg-black text-white' : 'border border-black'
          }`}
        >
          Writer Applications {applications.length > 0 && `(${applications.length})`}
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-black rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-600">
              Found {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
            </p>
          )}
        </div>
      )}

      {activeTab === 'users' ? (
        <div className="bg-white border border-black rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.uid}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-black text-white rounded-full flex items-center justify-center">
                          {user.displayName[0].toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {updatingRole === user.uid ? (
                        <div className="relative">
                          <select
                            defaultValue={user.role}
                            onChange={(e) => handleUpdateRole(user.uid, e.target.value as UserRole)}
                            className="appearance-none w-32 px-3 py-1 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          >
                            {AVAILABLE_ROLES.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                        </div>
                      ) : (
                        <button
                          onClick={() => setUpdatingRole(user.uid)}
                          className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          {user.role}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleToggleUserStatus(user.uid, user.status)}
                        className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                          user.status === 'active'
                            ? 'border-red-300 text-red-700 hover:bg-red-50'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {user.status === 'active' ? (
                          <>
                            <UserX className="h-4 w-4 mr-2" />
                            Ban User
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Unban User
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <p className="text-xl font-semibold mb-2">No users found</p>
                <p className="text-gray-600">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'reports' ? (
        <div className="bg-white border border-black rounded-lg overflow-hidden">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No pending reports</h3>
              <p className="text-gray-500">All reports have been resolved</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reports.map((report) => (
                <div key={report.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium">Report against {report.reportedUserName}</h3>
                      <p className="text-sm text-gray-500">Reported by {report.reporterUserName}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {report.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">Reported Message:</p>
                    <p className="font-medium">{report.messageContent}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Reason for Report:</p>
                    <p>{report.reason}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Reported on {formatDate(report.createdAt)}
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleToggleUserStatus(report.reportedUserId, 'active')}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                      >
                        Ban User
                      </button>
                      <button
                        onClick={() => handleResolveReport(report.id, report.reportedUserId)}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                      >
                        Resolve Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'applications' ? (
        <div className="bg-white border border-black rounded-lg overflow-hidden">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No pending applications</h3>
              <p className="text-gray-500">All writer applications have been reviewed</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {applications.map((application) => (
                <div key={application.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium">{application.username}</h3>
                      <p className="text-sm text-gray-500">{application.email}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {application.status}
                    </span>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="font-medium mb-2">Motivation</h4>
                      <p className="text-gray-600">{application.reason}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Writing Experience</h4>
                      <p className="text-gray-600">{application.experience}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Topics of Interest</h4>
                      <p className="text-gray-600">{application.topics}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Applied on {formatDate(application.createdAt)}
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleApplicationAction(application.id, application.userId, 'rejected')}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApplicationAction(application.id, application.userId, 'approved')}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-black rounded-lg overflow-hidden">
          {pendingPosts.length === 0 ? (
            <div className="text-center py-12">
              <PenLine className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No pending posts</h3>
              <p className="text-gray-500">All posts have been reviewed</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingPosts.map((post) => (
                <div key={post.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium">{post.title}</h3>
                      <p className="text-sm text-gray-500">By {post.author}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {post.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">Post Content:</p>
                    <div className="prose prose-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content.length > 300 
                          ? post.content.slice(0, 300) + '...' 
                          : post.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Submitted on {formatDate(post.createdAt)}
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handlePostAction(post.id, 'rejected')}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handlePostAction(post.id, 'approved')}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}