import React, { useState, useEffect } from 'react';
import { 
  Users, Layout, Activity, BookOpen, UsersRound, DollarSign, 
  MessageSquare, Music, FileText, Search, Filter, Download,
  ArrowLeft, Shield, Calendar, Mail, User as UserIcon, LogOut,
  TrendingUp, Eye, Edit, Trash2, CheckCircle2, XCircle, Upload, Video, ToggleLeft, ToggleRight, Plus,
  Sparkles, Target, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy, limit, doc, setDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { isAdminEmail } from '../utils/admin';
import { getSettings, updateSettings } from '../utils/settings';
import { LIVE_CLASSES, RECORDED_CLASSES, ASANAS, INSTRUCTORS } from '../constants';
import { Asana, Instructor } from '../types';
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

type TabType = 'overview' | 'users' | 'journey' | 'asanas' | 'asanas-manage' | 'classes' | 'classes-manage' | 'instructors' | 'instructors-manage' | 'community' | 'pricing' | 'meditation' | 'research' | 'contact' | 'newsletter';

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
  
  // Classes management state
  const [classesComingSoon, setClassesComingSoon] = useState(true);
  const [classesWithVideos, setClassesWithVideos] = useState<Record<string, string>>({}); // classId -> videoUrl
  const [uploadingVideo, setUploadingVideo] = useState<string | null>(null);
  
  // Asanas management state
  const [asanas, setAsanas] = useState<Asana[]>([]);
  const [editingAsana, setEditingAsana] = useState<Asana | null>(null);
  const [isAsanaFormOpen, setIsAsanaFormOpen] = useState(false);
  
  // Instructors management state
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [isInstructorFormOpen, setIsInstructorFormOpen] = useState(false);

  // TEMPORARY: No auth required - anyone can access
  const isAdmin = true; // Always true for now
  const isAuthenticated = true; // Always true for now

  useEffect(() => {
    // Load data immediately without auth check
    console.log('✅ Loading admin data (no auth required)...');
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Loading admin data...');
      
      // Load users from Firestore
      try {
        console.log('👥 Loading users from Firestore...');
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const firestoreUsers: UserData[] = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unknown',
            email: data.email || '',
            joinDate: data.joinDate || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            plan: data.plan || null,
            lastLogin: data.lastLoginAt?.toDate?.()?.toISOString() || null,
            source: 'firebase' as const,
          };
        });
        console.log(`✅ Loaded ${firestoreUsers.length} users from Firestore`);
        
        // Also load localStorage users (for backward compatibility)
        const localUsers = JSON.parse(localStorage.getItem('yogaFlowUsers') || '[]');
        const localStorageUsers: UserData[] = localUsers.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          joinDate: u.joinDate,
          plan: u.plan,
          source: 'localStorage' as const,
        }));

        // Combine users (Firestore users first, then localStorage)
        const allUsers = [...firestoreUsers, ...localStorageUsers];
        console.log(`📊 Total users: ${allUsers.length} (${firestoreUsers.length} from Firestore, ${localStorageUsers.length} from localStorage)`);
        setUsers(allUsers);
      } catch (error: any) {
        console.error('❌ Error loading users:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        // Set empty array on error
        setUsers([]);
      }

      // Load contact form submissions
      try {
        console.log('📧 Loading contact form submissions...');
        // Try with orderBy first, fallback to simple query if timestamp doesn't exist
        let contactSnapshot;
        try {
          const contactQuery = query(
            collection(db, 'contact_form'),
            orderBy('createdAt', 'desc'),
            limit(100)
          );
          contactSnapshot = await getDocs(contactQuery);
        } catch (orderByError: any) {
          // If orderBy fails (no index or field missing), just get all docs
          console.warn('⚠️ orderBy failed, using simple query:', orderByError);
          contactSnapshot = await getDocs(collection(db, 'contact_form'));
        }
        
        const contacts: ContactSubmission[] = contactSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            inquiryType: data.inquiryType || 'General Inquiry',
            message: data.message || '',
            timestamp: data.timestamp,
            createdAt: data.createdAt || data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
          };
        });
        // Sort by createdAt if orderBy didn't work
        contacts.sort((a, b) => {
          const dateA = new Date(a.createdAt || '').getTime();
          const dateB = new Date(b.createdAt || '').getTime();
          return dateB - dateA;
        });
        console.log(`✅ Loaded ${contacts.length} contact submissions`);
        setContactSubmissions(contacts);
      } catch (error: any) {
        console.error('❌ Error loading contact submissions:', error);
        console.error('Error code:', error.code);
        setContactSubmissions([]);
      }

      // Load newsletter subscribers
      try {
        console.log('📬 Loading newsletter subscribers...');
        let newsletterSnapshot;
        try {
          const newsletterQuery = query(
            collection(db, 'newsletter_subscribers'),
            orderBy('subscribedAt', 'desc'),
            limit(100)
          );
          newsletterSnapshot = await getDocs(newsletterQuery);
        } catch (orderByError: any) {
          console.warn('⚠️ orderBy failed, using simple query:', orderByError);
          newsletterSnapshot = await getDocs(collection(db, 'newsletter_subscribers'));
        }
        
        const subscribers: NewsletterSubscriber[] = newsletterSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            email: data.email || '',
            subscribedAt: data.subscribedAt,
            source: data.source || 'unknown',
          };
        });
        // Sort by subscribedAt if orderBy didn't work
        subscribers.sort((a, b) => {
          const dateA = a.subscribedAt?.toDate?.()?.getTime() || 0;
          const dateB = b.subscribedAt?.toDate?.()?.getTime() || 0;
          return dateB - dateA;
        });
        console.log(`✅ Loaded ${subscribers.length} newsletter subscribers`);
        setNewsletterSubscribers(subscribers);
      } catch (error: any) {
        console.error('❌ Error loading newsletter subscribers:', error);
        console.error('Error code:', error.code);
        setNewsletterSubscribers([]);
      }
      
      // Load app settings
      try {
        console.log('⚙️ Loading app settings...');
        const settings = await getSettings();
        setClassesComingSoon(settings.classesComingSoon);
        console.log('✅ Settings loaded:', settings);
      } catch (error: any) {
        console.error('❌ Error loading settings:', error);
      }

      // Load class videos from Firestore
      try {
        console.log('🎥 Loading class videos...');
        const videosSnapshot = await getDocs(collection(db, 'class_videos'));
        const videosMap: Record<string, string> = {};
        videosSnapshot.docs.forEach(doc => {
          const data = doc.data();
          videosMap[data.classId] = data.videoUrl;
        });
        setClassesWithVideos(videosMap);
        console.log(`✅ Loaded ${Object.keys(videosMap).length} class videos`);
      } catch (error: any) {
        console.error('❌ Error loading class videos:', error);
      }

      // Load asanas from Firestore
      try {
        console.log('🧘 Loading asanas...');
        const asanasSnapshot = await getDocs(collection(db, 'asanas'));
        if (asanasSnapshot.empty) {
          // Initialize with default asanas if empty
          const defaultAsanas = ASANAS;
          for (const asana of defaultAsanas) {
            await setDoc(doc(db, 'asanas', asana.id), asana);
          }
          setAsanas(defaultAsanas);
          console.log('✅ Initialized asanas with defaults');
        } else {
          const loadedAsanas: Asana[] = asanasSnapshot.docs
            .map(doc => doc.data() as Asana)
            .filter(asana => !asana.deleted); // Filter out deleted asanas
          setAsanas(loadedAsanas);
          console.log(`✅ Loaded ${loadedAsanas.length} asanas`);
        }
      } catch (error: any) {
        console.error('❌ Error loading asanas:', error);
        // Fallback to constants
        setAsanas(ASANAS);
      }

      // Load instructors from Firestore
      try {
        console.log('👨‍🏫 Loading instructors...');
        const instructorsSnapshot = await getDocs(collection(db, 'instructors'));
        if (instructorsSnapshot.empty) {
          // Initialize with default instructors if empty
          const defaultInstructors = INSTRUCTORS;
          for (const instructor of defaultInstructors) {
            await setDoc(doc(db, 'instructors', instructor.id), instructor);
          }
          setInstructors(defaultInstructors);
          console.log('✅ Initialized instructors with defaults');
        } else {
          const loadedInstructors: Instructor[] = instructorsSnapshot.docs.map(doc => doc.data() as Instructor);
          setInstructors(loadedInstructors);
          console.log(`✅ Loaded ${loadedInstructors.length} instructors`);
        }
      } catch (error: any) {
        console.error('❌ Error loading instructors:', error);
        // Fallback to constants
        setInstructors(INSTRUCTORS);
      }
      
      console.log('✅ Admin data loading complete');
    } catch (error: any) {
      console.error('❌ Error loading admin data:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
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
    { id: 'classes-manage' as TabType, label: 'Classes Management', icon: Video },
    { id: 'asanas-manage' as TabType, label: 'Asanas Management', icon: BookOpen },
    { id: 'instructors-manage' as TabType, label: 'Instructors Management', icon: UsersRound },
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

  // Toggle "coming soon" overlay
  const handleToggleComingSoon = async () => {
    const newValue = !classesComingSoon;
    setClassesComingSoon(newValue);
    try {
      await updateSettings({ classesComingSoon: newValue });
      console.log('✅ Coming soon toggle updated:', newValue);
    } catch (error) {
      console.error('❌ Error updating coming soon toggle:', error);
      // Revert on error
      setClassesComingSoon(!newValue);
    }
  };

  // Handle asana save
  const handleSaveAsana = async (asana: Asana) => {
    try {
      await setDoc(doc(db, 'asanas', asana.id), asana);
      setAsanas(prev => {
        const existing = prev.findIndex(a => a.id === asana.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = asana;
          return updated;
        }
        return [...prev, asana];
      });
      setEditingAsana(null);
      setIsAsanaFormOpen(false);
      console.log('✅ Asana saved:', asana.id);
    } catch (error) {
      console.error('❌ Error saving asana:', error);
      alert('Failed to save asana. Please try again.');
    }
  };

  // Handle asana delete
  const handleDeleteAsana = async (asanaId: string) => {
    if (!confirm('Are you sure you want to delete this asana?')) return;
    try {
      // Mark as deleted instead of actually deleting
      await setDoc(doc(db, 'asanas', asanaId), { deleted: true }, { merge: true });
      setAsanas(prev => prev.filter(a => a.id !== asanaId));
      console.log('✅ Asana deleted:', asanaId);
    } catch (error) {
      console.error('❌ Error deleting asana:', error);
      alert('Failed to delete asana. Please try again.');
    }
  };

  // Handle instructor save
  const handleSaveInstructor = async (instructor: Instructor) => {
    try {
      await setDoc(doc(db, 'instructors', instructor.id), instructor);
      setInstructors(prev => {
        const existing = prev.findIndex(i => i.id === instructor.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = instructor;
          return updated;
        }
        return [...prev, instructor];
      });
      setEditingInstructor(null);
      setIsInstructorFormOpen(false);
      console.log('✅ Instructor saved:', instructor.id);
    } catch (error) {
      console.error('❌ Error saving instructor:', error);
      alert('Failed to save instructor. Please try again.');
    }
  };

  // Handle video upload (simplified - just URL input for now)
  const handleVideoUpload = async (classId: string, videoUrl: string) => {
    if (!videoUrl.trim()) {
      alert('Please enter a video URL');
      return;
    }

    setUploadingVideo(classId);
    try {
      // Check if video already exists for this class
      const allVideos = await getDocs(collection(db, 'class_videos'));
      const existingVideo = allVideos.docs.find(doc => doc.data().classId === classId);

      if (existingVideo) {
        // Update existing video
        await setDoc(doc(db, 'class_videos', existingVideo.id), {
          classId,
          videoUrl: videoUrl.trim(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else {
        // Create new video
        await addDoc(collection(db, 'class_videos'), {
          classId,
          videoUrl: videoUrl.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Update local state
      setClassesWithVideos(prev => ({
        ...prev,
        [classId]: videoUrl.trim()
      }));

      console.log('✅ Video uploaded for class:', classId);
    } catch (error) {
      console.error('❌ Error uploading video:', error);
      alert('Failed to upload video. Please try again.');
    } finally {
      setUploadingVideo(null);
    }
  };

  // TEMPORARY: No auth gates - show dashboard directly

  // Debug: Log when component renders
  useEffect(() => {
    console.log('🎯 AdminDashboard component rendered');
    console.log('📊 Current state:', {
      isLoading,
      usersCount: users.length,
      contactsCount: contactSubmissions.length,
      subscribersCount: newsletterSubscribers.length
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50" style={{ cursor: 'default' }}>
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
                  <p className="text-xs text-slate-500">Public Access (No Auth Required)</p>
                </div>
              </div>
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="font-medium">Back to Site</span>
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

              {/* Asanas Management Tab */}
              {activeTab === 'asanas-manage' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Asanas Management</h2>
                    <button
                      onClick={() => {
                        setEditingAsana(null);
                        setIsAsanaFormOpen(true);
                      }}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                    >
                      <Plus size={18} />
                      <span>Add New Asana</span>
                    </button>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="divide-y divide-slate-200">
                      {asanas.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500">
                          No asanas found. Add your first asana!
                        </div>
                      ) : (
                        asanas.map((asana) => (
                          <div key={asana.id} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3 flex-wrap">
                                  <h3 className="text-xl font-bold text-slate-900">{asana.sanskritName}</h3>
                                  <span className="text-sm text-slate-500 italic">{asana.englishName}</span>
                                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                                    {asana.level}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 mb-2 line-clamp-2">{asana.description}</p>
                                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                  <span>Category: {asana.category}</span>
                                  <span>•</span>
                                  <span>Benefits: {asana.benefits?.length || 0} items</span>
                                  <span>•</span>
                                  <span>Steps: {asana.howTo?.length || 0} items</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingAsana({ ...asana });
                                    setIsAsanaFormOpen(true);
                                  }}
                                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                  <Edit size={16} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteAsana(asana.id)}
                                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                                >
                                  <Trash2 size={16} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'asanas' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Asanas Section Preview</h2>
                    <button
                      onClick={() => {
                        setEditingAsana(null);
                        setIsAsanaFormOpen(true);
                      }}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Plus size={18} />
                      <span>Add New Asana</span>
                    </button>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Custom Asanas Display with Edit Buttons */}
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {asanas.map((asana) => (
                          <div key={asana.id} className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-0 hover:border-teal-200 hover:shadow-2xl transition-all duration-700 flex flex-col h-full overflow-hidden">
                            {/* Edit Button - Top Right */}
                            <button
                              onClick={() => {
                                setEditingAsana({ ...asana });
                                setIsAsanaFormOpen(true);
                              }}
                              className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1.5 text-xs shadow-lg opacity-0 group-hover:opacity-100"
                              title={`Edit ${asana.englishName}`}
                            >
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>
                            
                            <div className="relative aspect-[16/10] overflow-hidden">
                              <img 
                                src={asana.imageUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"} 
                                alt={asana.englishName}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                              <div className="absolute bottom-6 left-8">
                                <span className="text-[9px] font-bold text-white uppercase tracking-widest px-3 py-1 bg-teal-600 rounded-full mb-3 inline-block shadow-lg">
                                  {asana.level}
                                </span>
                              </div>
                            </div>

                            <div className="p-10 flex flex-col flex-grow">
                              <div className="flex justify-between items-start mb-8">
                                <div>
                                  <h3 className="text-3xl font-serif font-bold text-slate-900 leading-tight mb-1">{asana.sanskritName}</h3>
                                  <p className="text-sm text-slate-500 font-light italic">{asana.englishName}</p>
                                </div>
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-teal-600 group-hover:text-white transition-all duration-700 shrink-0">
                                  <Target size={20} />
                                </div>
                              </div>

                              <div className="space-y-6 mb-10 flex-grow">
                                <p className="text-sm text-slate-600 leading-relaxed font-light">
                                  {asana.description}
                                </p>
                                
                                <div className="space-y-3">
                                  <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={12} className="text-teal-50" /> Key Benefits
                                  </h4>
                                  <ul className="space-y-2">
                                    {asana.benefits?.map((b, i) => (
                                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                        <span className="w-1 h-1 bg-teal-200 rounded-full mt-1.5 shrink-0"></span>
                                        {b}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-xs text-slate-600">
                                  <span className="font-bold text-teal-700 not-italic mr-1">Focus:</span> {asana.focusCue}
                                </div>
                              </div>

                              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{asana.category}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 flex items-center gap-1">
                                  Learn Technique <ChevronRight size={14} />
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructors Management Tab */}
              {activeTab === 'instructors-manage' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Instructors Management</h2>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="divide-y divide-slate-200">
                      {instructors.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500">
                          No instructors found.
                        </div>
                      ) : (
                        instructors.map((instructor) => (
                          <div key={instructor.id} className="p-6 hover:bg-slate-50">
                            <div className="flex items-start justify-between gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                  <h3 className="text-xl font-bold text-slate-900">{instructor.name}</h3>
                                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                                    {instructor.role}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">{instructor.bio}</p>
                                <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-2">
                                  <span>Lineage: {instructor.lineage}</span>
                                  {instructor.contact && (
                                    <>
                                      <span>•</span>
                                      <span>Email: {instructor.contact.email}</span>
                                      <span>•</span>
                                      <span>Phone: {instructor.contact.phone}</span>
                                    </>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {instructor.specialties.slice(0, 3).map((spec, i) => (
                                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                                      {spec}
                                    </span>
                                  ))}
                                  {instructor.specialties.length > 3 && (
                                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                                      +{instructor.specialties.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setEditingInstructor(instructor);
                                  setIsInstructorFormOpen(true);
                                }}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                              >
                                <Edit size={16} />
                                <span>Edit</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Classes Management Tab */}
              {activeTab === 'classes-manage' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Classes Management</h2>
                  </div>

                  {/* Coming Soon Toggle */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Coming Soon Overlay</h3>
                        <p className="text-sm text-slate-600">
                          Toggle the "Coming Soon" overlay on the classes page. When disabled, users can see all classes.
                        </p>
                      </div>
                      <button
                        onClick={handleToggleComingSoon}
                        className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${
                          classesComingSoon
                            ? 'bg-teal-600 text-white hover:bg-teal-700'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {classesComingSoon ? (
                          <>
                            <ToggleRight size={24} />
                            <span>Enabled</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={24} />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">
                        <strong>Current Status:</strong> {classesComingSoon ? 'Overlay is showing (classes hidden)' : 'Overlay is hidden (classes visible)'}
                      </p>
                    </div>
                  </div>

                  {/* Live Classes Video Management */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900">Live Classes - Video Upload</h3>
                      <p className="text-sm text-slate-600 mt-1">Upload video URLs for live classes</p>
                    </div>
                    <div className="divide-y divide-slate-200">
                      {LIVE_CLASSES.map((cls) => (
                        <div key={cls.id} className="p-6 hover:bg-slate-50">
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900 mb-1">{cls.title}</h4>
                              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                                <span>{cls.instructor}</span>
                                <span>•</span>
                                <span>{cls.type}</span>
                                <span>•</span>
                                <span>{cls.level}</span>
                                <span>•</span>
                                <span>{cls.time}</span>
                              </div>
                              {classesWithVideos[cls.id] && (
                                <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                                  <p className="text-xs font-medium text-teal-900 mb-1">Current Video:</p>
                                  <a 
                                    href={classesWithVideos[cls.id]} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-teal-600 hover:underline break-all"
                                  >
                                    {classesWithVideos[cls.id]}
                                  </a>
                                </div>
                              )}
                            </div>
                            <VideoUploadForm
                              classId={cls.id}
                              currentVideoUrl={classesWithVideos[cls.id]}
                              onUpload={handleVideoUpload}
                              isUploading={uploadingVideo === cls.id}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recorded Classes Video Management */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900">Recorded Classes (Archives) - Video Upload</h3>
                      <p className="text-sm text-slate-600 mt-1">Upload video URLs for archived classes</p>
                    </div>
                    <div className="divide-y divide-slate-200">
                      {RECORDED_CLASSES.map((cls) => (
                        <div key={cls.id} className="p-6 hover:bg-slate-50">
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900 mb-1">{cls.title}</h4>
                              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                                <span>{cls.instructor}</span>
                                <span>•</span>
                                <span>{cls.type}</span>
                                <span>•</span>
                                <span>{cls.level}</span>
                                <span>•</span>
                                <span>{cls.duration}</span>
                              </div>
                              {classesWithVideos[cls.id] && (
                                <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                                  <p className="text-xs font-medium text-teal-900 mb-1">Current Video:</p>
                                  <a 
                                    href={classesWithVideos[cls.id]} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-teal-600 hover:underline break-all"
                                  >
                                    {classesWithVideos[cls.id]}
                                  </a>
                                </div>
                              )}
                            </div>
                            <VideoUploadForm
                              classId={cls.id}
                              currentVideoUrl={classesWithVideos[cls.id]}
                              onUpload={handleVideoUpload}
                              isUploading={uploadingVideo === cls.id}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
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

      {/* Asana Form Modal */}
      {isAsanaFormOpen && (
        <AsanaFormModal
          asana={editingAsana}
          onSave={handleSaveAsana}
          onClose={() => {
            setIsAsanaFormOpen(false);
            setEditingAsana(null);
          }}
        />
      )}

      {/* Instructor Form Modal */}
      {isInstructorFormOpen && (
        <InstructorFormModal
          instructor={editingInstructor}
          onSave={handleSaveInstructor}
          onClose={() => {
            setIsInstructorFormOpen(false);
            setEditingInstructor(null);
          }}
        />
      )}
    </div>
  );
};

// Video Upload Form Component
interface VideoUploadFormProps {
  classId: string;
  currentVideoUrl?: string;
  onUpload: (classId: string, videoUrl: string) => void;
  isUploading: boolean;
}

const VideoUploadForm: React.FC<VideoUploadFormProps> = ({ classId, currentVideoUrl, onUpload, isUploading }) => {
  const [videoUrl, setVideoUrl] = useState(currentVideoUrl || '');

  useEffect(() => {
    setVideoUrl(currentVideoUrl || '');
  }, [currentVideoUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoUrl.trim()) {
      onUpload(classId, videoUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 min-w-[400px]">
      <div className="flex-1">
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Enter video URL (YouTube, Vimeo, etc.)"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          disabled={isUploading}
        />
      </div>
      <button
        type="submit"
        disabled={isUploading || !videoUrl.trim()}
        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isUploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Uploading...</span>
          </>
        ) : currentVideoUrl ? (
          <>
            <Edit size={16} />
            <span>Update</span>
          </>
        ) : (
          <>
            <Upload size={16} />
            <span>Upload</span>
          </>
        )}
      </button>
    </form>
  );
};

// Asana Form Modal Component
interface AsanaFormModalProps {
  asana: Asana | null;
  onSave: (asana: Asana) => void;
  onClose: () => void;
}

const AsanaFormModal: React.FC<AsanaFormModalProps> = ({ asana, onSave, onClose }) => {
  const [formData, setFormData] = useState<Asana>(asana ? { ...asana } : {
    id: '',
    sanskritName: '',
    englishName: '',
    category: '',
    level: 'Beginner',
    description: '',
    benefits: [''],
    howTo: [''],
    focusCue: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (asana) {
      setFormData({ ...asana });
    } else {
      setFormData({
        id: '',
        sanskritName: '',
        englishName: '',
        category: '',
        level: 'Beginner',
        description: '',
        benefits: [''],
        howTo: [''],
        focusCue: '',
        imageUrl: '',
      });
    }
  }, [asana]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate ID if new asana
    let finalId = formData.id;
    if (!finalId || finalId === '') {
      finalId = formData.englishName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    
    // Filter out empty benefits and howTo
    const cleanBenefits = formData.benefits.filter(b => b.trim() !== '');
    const cleanHowTo = formData.howTo.filter(h => h.trim() !== '');
    
    // Ensure at least one benefit and one howTo
    if (cleanBenefits.length === 0 || cleanHowTo.length === 0) {
      alert('Please add at least one benefit and one "How To" step.');
      return;
    }
    
    const finalAsana: Asana = {
      ...formData,
      id: finalId,
      benefits: cleanBenefits,
      howTo: cleanHowTo,
    };
    
    onSave(finalAsana);
  };

  const addBenefit = () => {
    setFormData({ ...formData, benefits: [...formData.benefits, ''] });
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const removeBenefit = (index: number) => {
    setFormData({ ...formData, benefits: formData.benefits.filter((_, i) => i !== index) });
  };

  const addHowTo = () => {
    setFormData({ ...formData, howTo: [...formData.howTo, ''] });
  };

  const updateHowTo = (index: number, value: string) => {
    const newHowTo = [...formData.howTo];
    newHowTo[index] = value;
    setFormData({ ...formData, howTo: newHowTo });
  };

  const removeHowTo = (index: number) => {
    setFormData({ ...formData, howTo: formData.howTo.filter((_, i) => i !== index) });
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-slate-900">
            {asana ? 'Edit Asana' : 'Add New Asana'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sanskrit Name *</label>
              <input
                type="text"
                required
                value={formData.sanskritName}
                onChange={(e) => setFormData({ ...formData, sanskritName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">English Name *</label>
              <input
                type="text"
                required
                value={formData.englishName}
                onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Level *</label>
              <select
                required
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as Asana['level'] })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Beginner–Intermediate">Beginner–Intermediate</option>
                <option value="Intermediate">Intermediate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Benefits *</label>
            {formData.benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  required
                  value={benefit}
                  onChange={(e) => updateBenefit(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder={`Benefit ${index + 1}`}
                />
                {formData.benefits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addBenefit}
              className="mt-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Benefit
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">How To Steps *</label>
            {formData.howTo.map((step, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  required
                  value={step}
                  onChange={(e) => updateHowTo(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder={`Step ${index + 1}`}
                />
                {formData.howTo.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHowTo(index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addHowTo}
              className="mt-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Step
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Focus Cue *</label>
            <input
              type="text"
              required
              value={formData.focusCue}
              onChange={(e) => setFormData({ ...formData, focusCue: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              {asana ? 'Update' : 'Create'} Asana
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Instructor Form Modal Component
interface InstructorFormModalProps {
  instructor: Instructor | null;
  onSave: (instructor: Instructor) => void;
  onClose: () => void;
}

const InstructorFormModal: React.FC<InstructorFormModalProps> = ({ instructor, onSave, onClose }) => {
  const [formData, setFormData] = useState<Instructor>(instructor || {
    id: '',
    name: '',
    role: '',
    lineage: '',
    bio: '',
    contact: { phone: '', email: '' },
    social: {},
    specialties: [''],
    education: [''],
    achievements: [],
    experience: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addArrayItem = (field: 'specialties' | 'education' | 'achievements' | 'experience') => {
    setFormData({ ...formData, [field]: [...(formData[field] || []), ''] });
  };

  const updateArrayItem = (field: 'specialties' | 'education' | 'achievements' | 'experience', index: number, value: string) => {
    const newArray = [...(formData[field] || [])];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const removeArrayItem = (field: 'specialties' | 'education' | 'achievements' | 'experience', index: number) => {
    const newArray = (formData[field] || []).filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-slate-900">Edit Instructor</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Lineage *</label>
            <input
              type="text"
              required
              value={formData.lineage}
              onChange={(e) => setFormData({ ...formData, lineage: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bio *</label>
            <textarea
              required
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.contact?.email || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, email: e.target.value, phone: formData.contact?.phone || '' }
                })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.contact?.phone || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, phone: e.target.value, email: formData.contact?.email || '' }
                })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Instagram</label>
              <input
                type="text"
                value={formData.social?.instagram || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social: { ...formData.social, instagram: e.target.value }
                })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">YouTube</label>
              <input
                type="text"
                value={formData.social?.youtube || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social: { ...formData.social, youtube: e.target.value }
                })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Specialties</label>
            {(formData.specialties || []).map((spec, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={spec}
                  onChange={(e) => updateArrayItem('specialties', index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                {(formData.specialties?.length || 0) > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('specialties', index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('specialties')}
              className="mt-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Specialty
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Education</label>
            {(formData.education || []).map((edu, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={edu}
                  onChange={(e) => updateArrayItem('education', index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                {(formData.education?.length || 0) > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('education', index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('education')}
              className="mt-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Education
            </button>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Update Instructor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
