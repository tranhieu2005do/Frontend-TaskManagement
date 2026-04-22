import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';

const SecuritySection = ({ onUpdatePassword, isSaving }) => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState(false);
    const [validationError, setValidationError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setValidationError('');
    };

    const calculateStrength = (pwd) => {
        if (!pwd) return 0;
        let strength = 0;
        if (pwd.length > 6) strength += 25;
        if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength += 25;
        if (pwd.match(/\d/)) strength += 25;
        if (pwd.match(/[^a-zA-Z\d]/)) strength += 25;
        return strength;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.oldPassword || !formData.newPassword) {
            setValidationError('All password fields are required');
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }
        if (formData.newPassword.length < 6) {
            setValidationError('New password must be at least 6 characters');
            return;
        }

        const success = await onUpdatePassword(formData.oldPassword, formData.newPassword);
        if (success) {
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        }
    };

    const strength = calculateStrength(formData.newPassword);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div className="p-2.5 bg-white rounded-xl border border-emerald-100 text-emerald-500 shadow-sm">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-emerald-900">Account Security</h4>
                    <p className="text-xs text-emerald-600">Your account is currently protected with a strong password.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Lock size={14} /> Current Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPasswords ? "text" : "password"}
                            name="oldPassword"
                            value={formData.oldPassword}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 transition-all outline-none"
                            placeholder="Confirm your identity..."
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswords(!showPasswords)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors"
                        >
                            {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">New Password</label>
                        <input
                            type={showPasswords ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 transition-all outline-none"
                            placeholder="Min. 6 chars"
                        />
                        {formData.newPassword && (
                            <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${strength <= 25 ? 'bg-red-400' : strength <= 75 ? 'bg-amber-400' : 'bg-emerald-400'
                                        }`}
                                    style={{ width: `${strength}%` }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Confirm New Password</label>
                        <input
                            type={showPasswords ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 transition-all outline-none"
                        />
                    </div>
                </div>

                {validationError && (
                    <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-2 rounded-lg border border-red-100 animate-shake">
                        <AlertCircle size={14} /> {validationError}
                    </div>
                )}

                <div className="pt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-slate-900 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-black active:scale-95 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 min-w-[160px]"
                    >
                        {isSaving ? 'Processing...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SecuritySection;
