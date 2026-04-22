import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import {
    User,
    Settings,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Loader2
} from 'lucide-react';

// Hooks
import useProfile from '../hooks/useProfile';
import useUpdateProfile from '../hooks/useUpdateProfile';

// Sub-components
import ProfileInfoSection from '../components/profile/ProfileInfoSection';
import AccountSection from '../components/profile/AccountSection';
import SecuritySection from '../components/profile/SecuritySection';

import '../styles/profile.css';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const { user, loading, refresh } = useProfile();
    const { isSaving, error, success, updateName, updatePassword, resetStates } = useUpdateProfile();

    // Reset success/error state when switching tabs
    useEffect(() => {
        resetStates();
    }, [activeTab]);

    // Refresh user data when update is successful
    useEffect(() => {
        if (success && activeTab === 'profile') {
            refresh();
        }
    }, [success]);

    const tabs = [
        { id: 'profile', label: 'Profile Info', icon: <User size={18} />, description: 'Your public identity' },
        { id: 'account', label: 'Account Settings', icon: <Settings size={18} />, description: 'Email and preferences' },
        { id: 'security', label: 'Security', icon: <ShieldCheck size={18} />, description: 'Password and protection' },
    ];

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar mb-4 />
                <div className="dashboard-content flex items-center justify-center bg-slate-50 min-h-screen">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-sky-500" size={32} />
                        <p className="text-slate-400 font-medium">Loading your profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-content bg-slate-50 min-h-screen">
                <div className="max-w-6xl mx-auto py-12 px-6">

                    <div className="flex flex-col md:flex-row gap-12 items-start">

                        {/* Left Column: Navigation Sidebar */}
                        <aside className="w-full md:w-72 shrink-0 space-y-2">
                            <div className="mb-8 pl-2">
                                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Personal Account</p>
                            </div>

                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 ${activeTab === tab.id
                                                ? 'bg-white shadow-md shadow-slate-200/50 text-sky-600'
                                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-sky-50 text-sky-600' : 'bg-transparent text-slate-400 group-hover:bg-white group-hover:text-slate-600'
                                                }`}>
                                                {tab.icon}
                                            </div>
                                            <div className="text-left">
                                                <span className="block text-sm font-bold leading-tight">{tab.label}</span>
                                                <span className="block text-[10px] text-slate-400 font-medium group-hover:text-slate-500 transition-colors">
                                                    {tab.description}
                                                </span>
                                            </div>
                                        </div>
                                        {activeTab === tab.id && <ChevronRight size={16} className="text-sky-300" />}
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* Right Column: Content Area */}
                        <main className="flex-1 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 min-h-[600px] flex flex-col overflow-hidden relative">

                            {/* Content Header */}
                            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {tabs.find(t => t.id === activeTab)?.label}
                                    </h2>
                                    <p className="text-xs text-slate-400 font-medium mt-1">
                                        Manage your account settings and preferences.
                                    </p>
                                </div>
                            </div>

                            {/* Success/Error Feedback Banner */}
                            {success && (
                                <div className="mx-10 mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-500">
                                    <div className="p-1.5 bg-white rounded-full text-emerald-500 shadow-sm">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <p className="text-sm font-bold text-emerald-900">Changes saved successfully!</p>
                                </div>
                            )}
                            {error && (
                                <div className="mx-10 mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-500">
                                    <div className="p-1.5 bg-white rounded-full text-red-500 shadow-sm">
                                        <AlertCircle size={16} />
                                    </div>
                                    <p className="text-sm font-bold text-red-900">{error}</p>
                                </div>
                            )}

                            {/* Main Section Content */}
                            <div className="flex-1 p-10">
                                {activeTab === 'profile' && (
                                    <ProfileInfoSection
                                        user={user}
                                        onUpdateName={updateName}
                                        isSaving={isSaving}
                                    />
                                )}
                                {activeTab === 'account' && (
                                    <AccountSection user={user} />
                                )}
                                {activeTab === 'security' && (
                                    <SecuritySection
                                        onUpdatePassword={updatePassword}
                                        isSaving={isSaving}
                                    />
                                )}
                            </div>

                            {/* Subtle footer */}
                            <div className="px-10 py-6 bg-slate-50/30 border-t border-slate-50 text-[10px] text-slate-300 font-bold uppercase tracking-widest text-right">
                                Profile Management v2.0
                            </div>

                        </main>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
