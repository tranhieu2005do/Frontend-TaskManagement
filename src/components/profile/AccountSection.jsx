import React, { useState } from 'react';
import { Mail, Phone, Globe, Info } from 'lucide-react';

const AccountSection = ({ user }) => {
    const [phone, setPhone] = useState('+84 123 456 789');

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 gap-8">

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Mail size={14} /> Email Address
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="email"
                            readOnly
                            value={user?.email || ''}
                            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed outline-none"
                        />
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full uppercase">Verified</span>
                    </div>
                    <p className="text-[10px] text-slate-400 ml-1 italic flex items-center gap-1">
                        <Info size={10} /> Email changes are currently restricted.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Phone size={14} /> Phone Number
                        </label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition-all outline-none"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Globe size={14} /> Language
                        </label>
                        <select className="w-full h-[46px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 outline-none appearance-none cursor-pointer">
                            <option>English (US)</option>
                            <option>Tiếng Việt</option>
                            <option>Japanese</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                    <div className="p-2 bg-white rounded-lg border border-amber-200 text-amber-500 h-fit">
                        <Info size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-amber-900 mb-1">Experimental Features</h4>
                        <p className="text-xs text-amber-700 leading-relaxed">
                            Phone number and language settings are currently managed locally for preview purposes. API synchronization for these fields will be available in the next version.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AccountSection;
