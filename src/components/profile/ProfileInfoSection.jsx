import React, { useState, useEffect } from 'react';
import { Camera, Edit2, Check, X, User } from 'lucide-react';

const ProfileInfoSection = ({ user, onUpdateName, isSaving }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.fullName || '');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setName(user?.fullName || '');
    }, [user]);

    const handleNameChange = (e) => {
        const newVal = e.target.value;
        setName(newVal);
        setHasChanges(newVal !== user?.fullName);
    };

    const handleSave = async () => {
        if (!hasChanges || isSaving) return;
        const success = await onUpdateName(name);
        if (success) {
            setIsEditing(false);
            setHasChanges(false);
        }
    };

    const handleCancel = () => {
        setName(user?.fullName || '');
        setIsEditing(false);
        setHasChanges(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-8 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.fullName}&background=0ea5e9&color=fff&size=200`}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg border border-slate-100 text-slate-500 hover:text-sky-600 transition-all">
                        <Camera size={16} />
                    </button>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">{user?.fullName}</h3>
                    <p className="text-slate-500 text-sm">{user?.email}</p>
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                        {user?.accountType || 'Free Member'}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="group pb-6 border-b border-slate-50">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <User size={14} /> Full Name
                        </label>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-[11px] font-bold text-sky-500 hover:text-sky-600 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                            >
                                <Edit2 size={12} /> Edit
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={name}
                                onChange={handleNameChange}
                                autoFocus
                                className="flex-1 bg-white border border-sky-500 rounded-lg px-3 py-2 text-sm focus:ring-4 focus:ring-sky-50 outline-none transition-all"
                            />
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !hasChanges}
                                className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 transition-all"
                            >
                                {isSaving ? <X className="animate-spin" size={16} /> : <Check size={16} />}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm font-medium text-slate-700 h-10 flex items-center">{user?.fullName}</p>
                    )}
                </div>

                <div className="pb-6 border-b border-slate-50">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Account ID</label>
                    <p className="text-sm font-mono text-slate-500">{user?.id || 'N/A'}</p>
                </div>

                <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Joined On</label>
                    <p className="text-sm text-slate-600 italic">{user?.memberSince}</p>
                </div>
            </div>

            {hasChanges && !isEditing && (
                <div className="flex items-center justify-end gap-3 pt-4 animate-in fade-in slide-in-from-bottom-2">
                    <button onClick={handleCancel} className="text-sm font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                    <button onClick={handleSave} className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-sky-100">
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileInfoSection;
