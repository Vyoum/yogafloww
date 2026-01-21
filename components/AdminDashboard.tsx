import React, { useState, useEffect } from 'react';
import { 
  Users, Layout, Activity, BookOpen, UsersRound, DollarSign, 
  MessageSquare, Music, FileText, Search, Filter, Download,
  ArrowLeft, Shield, Calendar, Mail, User as UserIcon, LogOut,
  TrendingUp, Eye, Edit, Trash2, CheckCircle2, XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { isAdminEmail } from '../utils/admin';
import { LoginModal, SignupModal } from './LoginModal';
import { ProblemSolution } from './ProblemSolution';
import { Timeline } from './Timeline';
import { Asanas } from './Asanas';
import { Classes } from './Classes';
import { Instructors } from './Instructors';
import { CommunityPage } from './CommunityPage';
import { Pricing } from './Pricing';
import { MeditationMusic } from './MeditationMusic';
import { Research } from './Research';
import { Contact } from './Contact';

interface AdminDashboardProps {
  onBack: () => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  joinDate?: string;
  plan?: string;
  source: 'firebase' | 'localStorage';
  lastLogin?: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  inquiryType: string;
  message: string;
  timestamp: any;
  createdAt?: string;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: any;
  source?: string;
}

type TabType = 'overview' | 'users' | 'journey' | 'asanas' | 'classes' | 'instructors' | 'community' | 'pricing' | 'meditation' | 'research' | 'contact' | 'newsletter';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [users, setUsers] = useState<UserData[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'firebase' | 'localStorage'>('all');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // Check if user is admin
  const isAdmin = isAdminEmail(user?.email);
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!isAdmin) return;
    loadData();
  }, [isAdmin, onBack]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load Firebase users (from auth - we'll simulate this since we can't directly list users)
      // In production, you'd use Firebase Admin SDK on backend
      const firebaseUsers: UserData[] = [];
      
      // Load localStorage users
      const localUsers = JSON.parse(localStorage.getItem('yogaFlowUsers') || '[]');
      const localStorageUsers: UserData[] = localUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        joinDate: u.joinDate,
        plan: u.plan,
        source: 'localStorage' as const,
      }));

      // Combine users
      const allUsers = [...firebaseUsers, ...localStorageUsers];
      setUsers(allUsers);

      // Load contact form submissions
      try {
        const contactQuery = query(
          collection(db, 'contact_form'),
          orderBy('timestamp', 'desc'),
          limit(100)
        );
        const contactSnapshot = await getDocs(contactQuery);
        const contacts: ContactSubmission[] = contactSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as ContactSubmission));
        setContactSubmissions(contacts);
      } catch (error) {
        console.error('Error loading contact submissions:', error);
      }

      // Load newsletter subscribers
      try {
        const newsletterQuery = query(
          collection(db, 'newsletter_subscribers'),
          orderBy('subscribedAt', 'desc'),
          limit(100)
        );
        const newsletterSnapshot = await getDocs(newsletterQuery);
        const subscribers: NewsletterSubscriber[] = newsletterSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as NewsletterSubscriber));
        setNewsletterSubscribers(subscribers);
      } catch (error) {
        console.error('Error loading newsletter subscribers:', error);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = userFilter === 'all' || u.source === userFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredContacts = contactSubmissions.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubscribers = newsletterSubscribers.filter(s =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Layout },
    { id: 'users' as TabType, label: 'Users', icon: Users },
    { id: 'journey' as TabType, label: 'Journey', icon: Activity },
    { id: 'asanas' as TabType, label: 'Asanas', icon: BookOpen },
    { id: 'classes' as TabType, label: 'Classes', icon: Calendar },
    { id: 'instructors' as TabType, label: 'Instructors', icon: UsersRound },
    { id: 'community' as TabType, label: 'Community', icon: MessageSquare },
    { id: 'pricing' as TabType, label: 'Pricing', icon: DollarSign },
    { id: 'meditation' as TabType, label: 'Meditation', icon: Music },
    { id: 'research' as TabType, label: 'Research', icon: FileText },
    { id: 'contact' as TabType, label: 'Contact', icon: Mail },
    { id: 'newsletter' as TabType, label: 'Newsletter', icon: TrendingUp },
  ];

  // Gate UI: don't silently redirect; show login/access-denied
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={22} className="text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600 text-sm mb-6">Please sign in to continue.</p>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={onBack}
            className="mt-3 w-full text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Back to site
          </button>
        </div>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSwitchToSignup={() => {
            setIsLoginModalOpen(false);
            setIsSignupModalOpen(true);
          }}
        />
        <SignupModal
          isOpen={isSignupModalOpen}
          onClose={() => setIsSignupModalOpen(false)}
          onSwitchToLogin={() => {
            setIsSignupModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={22} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access denied</h1>
          <p className="text-slate-600 text-sm mb-6">
            You’re signed in as <span className="font-medium">{user?.email}</span>, but this account isn’t allowed to access admin.
          </p>
          <p className="text-slate-500 text-xs mb-6">
            To allow this account, add it to <code className="font-mono">VITE_ADMIN_EMAILS</code> (comma-separated) in <code className="font-mono">.env</code>.
          </p>
          <button
            onClick={onBack}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Back to site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Site</span>
              </button>
              <div className="h-6 w-px bg-slate-300" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
                  <p className="text-xs text-slate-500">Welcome, {user?.name}</p>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-80px)] sticky top-[80px]">
          <nav className="p-4 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {isLoading && activeTab === 'overview' ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Users size={24} className="text-teal-600" />
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1">{users.length}</h3>
                        <p className="text-sm text-slate-600">Total Users</p>
                      </div>
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Mail size={24} className="text-blue-600" />
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1">{contactSubmissions.length}</h3>
                        <p className="text-sm text-slate-600">Contact Submissions</p>
                      </div>
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp size={24} className="text-green-600" />
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1">{newsletterSubscribers.length}</h3>
                        <p className="text-sm text-slate-600">Newsletter Subscribers</p>
                      </div>
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Activity size={24} className="text-purple-600" />
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1">
                          {users.filter(u => u.plan).length}
                        </h3>
                        <p className="text-sm text-slate-600">Active Subscriptions</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {tabs.slice(1).map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-teal-50 rounded-lg transition-colors"
                          >
                            <Icon size={24} className="text-teal-600" />
                            <span className="text-sm font-medium text-slate-700">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2">
                        <Search size={18} className="text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="outline-none text-sm"
                        />
                      </div>
                      <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value as any)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                      >
                        <option value="all">All Users</option>
                        <option value="firebase">Firebase</option>
                        <option value="localStorage">Local Storage</option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">User</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Join Date</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Plan</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Source</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                No users found
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                      <UserIcon size={18} className="text-teal-600" />
                                    </div>
                                    <span className="font-medium text-slate-900">{user.name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4">
                                  {user.plan ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                      {user.plan}
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                      No Plan
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    user.source === 'firebase'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-purple-100 text-purple-700'
                                  }`}>
                                    {user.source}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors">
                                      <Eye size={16} />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                      <Edit size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Submissions Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Contact Form Submissions</h2>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2">
                      <Search size={18} className="text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search submissions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="divide-y divide-slate-200">
                      {filteredContacts.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500">
                          No contact submissions found
                        </div>
                      ) : (
                        filteredContacts.map((contact) => (
                          <div key={contact.id} className="p-6 hover:bg-slate-50">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-bold text-slate-900">{contact.name}</h3>
                                <p className="text-sm text-slate-600">{contact.email}</p>
                              </div>
                              <div className="text-right">
                                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                                  {contact.inquiryType}
                                </span>
                                <p className="text-xs text-slate-500 mt-2">
                                  {contact.timestamp?.toDate ? 
                                    contact.timestamp.toDate().toLocaleString() : 
                                    contact.createdAt ? new Date(contact.createdAt).toLocaleString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-slate-700 mt-3">{contact.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Newsletter Subscribers Tab */}
              {activeTab === 'newsletter' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Newsletter Subscribers</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2">
                        <Search size={18} className="text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search subscribers..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="outline-none text-sm"
                        />
                      </div>
                      <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2">
                        <Download size={18} />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Subscribed At</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Source</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredSubscribers.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                No subscribers found
                              </td>
                            </tr>
                          ) : (
                            filteredSubscribers.map((subscriber) => (
                              <tr key={subscriber.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{subscriber.email}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {subscriber.subscribedAt?.toDate ? 
                                    subscriber.subscribedAt.toDate().toLocaleString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    {subscriber.source || 'website_footer'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                                    <CheckCircle2 size={12} />
                                    Active
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Sections */}
              {activeTab === 'journey' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Journey Section Preview</h2>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6">
                      <ProblemSolution />
                    </div>
                    <div className="border-t border-slate-200">
                      <Timeline onNavPricing={() => {}} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'asanas' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Asanas Section Preview</h2>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <Asanas onNavPricing={() => {}} />
                  </div>
                </div>
              )}

              {activeTab === 'classes' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Classes Section Preview</h2>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <Classes initialTab="live" onNavHome={() => {}} />
                  </div>
                </div>
              )}

              {activeTab === 'instructors' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Instructors Section Preview</h2>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <Instructors onViewProfile={() => {}} />
                  </div>
                </div>
              )}

              {activeTab === 'community' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Community Section Preview</h2>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <CommunityPage />
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Pricing Section Preview</h2>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <Pricing />
                  </div>
                </div>
              )}

              {activeTab === 'meditation' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Meditation Section Preview</h2>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <MeditationMusic />
                  </div>
                </div>
              )}

              {activeTab === 'research' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Research Section Preview</h2>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <Research />
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
