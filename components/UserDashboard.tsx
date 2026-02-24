import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import {
    User,
    Calendar,
    CreditCard,
    Heart,
    ChevronRight,
    Clock,
    CheckCircle2,
    PlayCircle,
    Video,
    LogOut,
    MapPin,
    Star,
    Shield
} from 'lucide-react';

interface UserDashboardProps {
    onBack: () => void;
    initialTab?: 'profile' | 'asanas' | 'classes' | 'subscription';
    onNavAdmin?: () => void;
}

type TabType = 'profile' | 'asanas' | 'classes' | 'subscription';

export const UserDashboard: React.FC<UserDashboardProps> = ({ onBack, initialTab = 'profile', onNavAdmin }) => {
    const { user, logout, isAdmin, isAdminChecking } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const handleLogout = () => {
        logout();
        onBack();
    };

    const tabs: { id: TabType; label: string; icon: React.FC<any> }[] = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'asanas', label: 'Saved Asanas', icon: Heart },
        { id: 'classes', label: 'My Classes', icon: Calendar },
        { id: 'subscription', label: 'Subscription', icon: CreditCard },
    ];

    // Mock Data
    const savedAsanas = [
        { id: 1, name: 'Adho Mukha Svanasana', englishName: 'Downward-Facing Dog', level: 'Beginner', duration: '1-3 mins', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800' },
        { id: 2, name: 'Vrikshasana', englishName: 'Tree Pose', level: 'Beginner', duration: '1-2 mins', image: 'https://images.unsplash.com/photo-1599901860904-17e0ed3af3ea?auto=format&fit=crop&q=80&w=800' },
        { id: 3, name: 'Natarajasana', englishName: 'Lord of the Dance Pose', level: 'Advanced', duration: '30-60 secs', image: 'https://images.unsplash.com/photo-1508704019882-f9cf40e475b4?auto=format&fit=crop&q=80&w=800' }
    ];

    const upcomingClasses = [
        { id: 1, title: 'Morning Vinyasa Flow', instructor: 'Elena Rodriguez', date: 'Tomorrow, 08:00 AM', duration: '60 min', type: 'Live Virtual' },
        { id: 2, title: 'Deep Tissue Yin Yoga', instructor: 'Marcus Chen', date: 'Oct 24, 06:30 PM', duration: '75 min', type: 'Studio' }
    ];

    const pastClasses = [
        { id: 3, title: 'Foundations of Hatha', instructor: 'Sarah Jenkins', date: 'Oct 18, 09:00 AM', duration: '60 min', type: 'Recorded' },
        { id: 4, title: 'Chakra Balancing Meditation', instructor: 'David Kim', date: 'Oct 15, 07:00 PM', duration: '45 min', type: 'Live Virtual' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4 tracking-tight">
                            Welcome back, {user?.name?.split(' ')[0] || 'Yogi'}
                        </h1>
                        <p className="text-lg text-slate-600">
                            Continue your journey to mindfulness and strength.
                        </p>
                    </div>
                    <Button variant="outline" onClick={onBack} className="rounded-full shrink-0">
                        Back to Home
                    </Button>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-32">
                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 font-medium ${isActive
                                                    ? 'bg-teal-600 text-white shadow-md transform scale-[1.02]'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-teal-600'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon size={20} className={isActive ? 'text-teal-100' : 'text-slate-400'} />
                                                {tab.label}
                                            </div>
                                            {isActive && <ChevronRight size={18} />}
                                        </button>
                                    );
                                })}
                            </nav>

                            <div className="mt-8 pt-6 border-t border-slate-100 space-y-2">
                                {isAdmin && !isAdminChecking && onNavAdmin && (
                                    <button
                                        onClick={onNavAdmin}
                                        className="w-full flex items-center gap-3 p-4 text-slate-600 hover:bg-slate-50 hover:text-teal-600 rounded-2xl transition-colors font-medium"
                                    >
                                        <Shield size={20} />
                                        Admin Dashboard
                                    </button>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 p-4 text-red-600 hover:bg-red-50 rounded-2xl transition-colors font-medium"
                                >
                                    <LogOut size={20} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:w-3/4">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[600px] animate-fade-in-up">

                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">My Profile</h2>
                                        <p className="text-slate-500">Manage your personal information and preferences.</p>
                                    </div>

                                    <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{user?.name || 'Yoga Student'}</h3>
                                            <p className="text-slate-500 mb-2">{user?.email || 'N/A'}</p>
                                            <span className="inline-flex py-1 px-3 bg-teal-100 text-teal-800 rounded-full text-xs font-bold tracking-wide uppercase">
                                                {user?.plan || 'Free Plan'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="p-6 border border-slate-100 rounded-2xl">
                                            <h4 className="font-bold text-slate-900 mb-4">Account Details</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm text-slate-500 mb-1">Full Name</p>
                                                    <p className="font-medium text-slate-900">{user?.name || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500 mb-1">Email Address</p>
                                                    <p className="font-medium text-slate-900">{user?.email || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500 mb-1">Member Since</p>
                                                    <p className="font-medium text-slate-900">{formatDate(user?.joinDate)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 border border-slate-100 rounded-2xl">
                                            <h4 className="font-bold text-slate-900 mb-4">Practice Stats</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-teal-50 p-4 rounded-xl text-center">
                                                    <p className="text-3xl font-serif font-bold text-teal-600 mb-1">24</p>
                                                    <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">Classes Attended</p>
                                                </div>
                                                <div className="bg-indigo-50 p-4 rounded-xl text-center">
                                                    <p className="text-3xl font-serif font-bold text-indigo-600 mb-1">12</p>
                                                    <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">Hours Practiced</p>
                                                </div>
                                                <div className="bg-rose-50 p-4 rounded-xl text-center col-span-2">
                                                    <p className="text-3xl font-serif font-bold text-rose-600 mb-1">5</p>
                                                    <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">Current Streak (Days)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Asanas Tab */}
                            {activeTab === 'asanas' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Saved Asanas</h2>
                                            <p className="text-slate-500">Your personalized library of favored poses.</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="rounded-full">
                                            Browse More
                                        </Button>
                                    </div>

                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {savedAsanas.map((asana) => (
                                            <div key={asana.id} className="group rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300">
                                                <div className="relative h-48 overflow-hidden">
                                                    <img
                                                        src={asana.image}
                                                        alt={asana.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                    <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-500 cursor-pointer shadow-sm">
                                                        <Heart size={16} fill="currentColor" />
                                                    </div>
                                                    <div className="absolute bottom-3 left-3 flex gap-2">
                                                        <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                                            {asana.level}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-5">
                                                    <h3 className="font-serif font-bold text-lg text-slate-900 mb-1">{asana.name}</h3>
                                                    <p className="text-sm text-slate-500 mb-4">{asana.englishName}</p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                                                            <Clock size={14} />
                                                            <span>{asana.duration}</span>
                                                        </div>
                                                        <button className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-1">
                                                            View Details <ChevronRight size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Classes Tab */}
                            {activeTab === 'classes' && (
                                <div className="space-y-10">
                                    <div>
                                        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">My Classes</h2>
                                        <p className="text-slate-500">Manage your schedule and view past sessions.</p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Calendar size={20} className="text-teal-600" /> Upcoming Classes
                                        </h3>
                                        <div className="space-y-4">
                                            {upcomingClasses.map((cls) => (
                                                <div key={cls.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white hover:border-teal-200 hover:shadow-md transition-all gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 shrink-0 mt-1">
                                                            {cls.type === 'Live Virtual' ? <Video size={24} /> : <MapPin size={24} />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 text-lg">{cls.title}</h4>
                                                            <p className="text-slate-500 text-sm mb-2">with {cls.instructor}</p>
                                                            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
                                                                <span className="bg-slate-100 px-2 py-1 rounded-md">{cls.date}</span>
                                                                <span className="flex items-center gap-1"><Clock size={14} /> {cls.duration}</span>
                                                                <span className="text-teal-600">{cls.type}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 sm:flex-col lg:flex-row w-full sm:w-auto mt-2 sm:mt-0">
                                                        <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-full">Reschedule</Button>
                                                        <Button variant="primary" size="sm" className="w-full sm:w-auto rounded-full">Join Room</Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <CheckCircle2 size={20} className="text-slate-400" /> Past Classes
                                        </h3>
                                        <div className="space-y-3">
                                            {pastClasses.map((cls) => (
                                                <div key={cls.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                                                            <PlayCircle size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800">{cls.title}</h4>
                                                            <p className="text-slate-500 text-xs">{cls.date} • {cls.instructor}</p>
                                                        </div>
                                                    </div>
                                                    <button className="text-teal-600 text-sm font-medium hover:underline">Watch Recording</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Subscription Tab */}
                            {activeTab === 'subscription' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Subscription & Billing</h2>
                                        <p className="text-slate-500">Manage your membership plan and payment methods.</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                                        {/* Decorative elements */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                                        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                            <div>
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase mb-4">
                                                    <Star size={12} className="fill-current" /> Active Plan
                                                </div>
                                                <h3 className="font-serif text-3xl font-bold mb-1">
                                                    {user?.plan === 'premium' ? 'Premium Annual' : 'Explorer Monthly'}
                                                </h3>
                                                <p className="text-teal-100">
                                                    {user?.plan === 'premium' ? '$199.00 / year' : '$29.00 / month'}
                                                </p>
                                            </div>

                                            <div className="text-left md:text-right">
                                                <p className="text-teal-100 text-sm mb-1">Next billing date</p>
                                                <p className="text-xl font-bold">Nov 24, 2026</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                                        <div className="p-6 border border-slate-100 rounded-2xl">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="font-bold text-slate-900">Payment Method</h4>
                                                <button className="text-teal-600 text-sm font-medium hover:underline">Edit</button>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                                                <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-white text-xs font-bold font-mono">
                                                    VISA
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">•••• •••• •••• 4242</p>
                                                    <p className="text-xs text-slate-500">Expires 12/28</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 border border-slate-100 rounded-2xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-slate-900">Billing History</h4>
                                                <button className="text-teal-600 text-sm font-medium hover:underline">View All</button>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div>
                                                        <p className="font-medium text-slate-900">Oct 24, 2026</p>
                                                        <p className="text-slate-500">Explorer Monthly</p>
                                                    </div>
                                                    <span className="font-medium">$29.00</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <div>
                                                        <p className="font-medium text-slate-900">Sep 24, 2026</p>
                                                        <p className="text-slate-500">Explorer Monthly</p>
                                                    </div>
                                                    <span className="font-medium">$29.00</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center pt-4">
                                        <Button variant="outline" className="text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700">
                                            Cancel Subscription
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
