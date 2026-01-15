
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Job, JobStatus, User, LogEntry, AdminPermission, 
  JobCategory, SalaryType, Location, WorkerProfile, 
  EmployerProfile, UserRole 
} from '../types';
import { CATEGORIES, STATES_AND_CITIES, MOCK_JOBS } from '../constants';

interface AdminViewProps {
  jobs: Job[];
  onUpdateStatus: (id: string, status: JobStatus, additionalProps?: Partial<Job>) => Promise<void>;
  onDelete: (id: string) => void;
  onClearReport: (id: string) => void;
  onVerifyEmployer: (id: string) => void;
  onLogout: () => void;
}

type AdminModule = 'OVERVIEW' | 'JOBS' | 'EMPLOYERS' | 'WORKERS' | 'ADMINS' | 'LOGS' | 'SETTINGS';

const AdminView: React.FC<AdminViewProps> = ({ jobs, onUpdateStatus, onDelete, onClearReport, onVerifyEmployer, onLogout }) => {
  const [activeModule, setActiveModule] = useState<AdminModule>('OVERVIEW');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [selectedEmployer, setSelectedEmployer] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<'JOB' | 'EMPLOYER' | 'WORKER' | 'ADMIN' | null>(null);
  
  const [managedAdmins, setManagedAdmins] = useState<User[]>(() => {
    const saved = localStorage.getItem('nearbykaam_managed_admins');
    return saved ? JSON.parse(saved) : [
      { phone: '9999999999', role: UserRole.ADMIN, isAuthenticated: true, profileCompleted: true, permissions: [AdminPermission.FULL_ACCESS] }
    ];
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('nearbykaam_admin_logs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const registeredWorkers = useMemo(() => {
    const saved = localStorage.getItem('nearbykaam_worker_profile');
    return saved ? [JSON.parse(saved) as WorkerProfile] : [];
  }, [activeModule]);

  const defaultFilters = {
    state: '',
    city: '',
    status: '' as JobStatus | '',
    category: '' as JobCategory | '',
    search: '',
    dateRange: 'ALL' as 'ALL' | 'TODAY' | 'WEEK' | 'MONTH', 
    verified: 'ALL',
    reported: 'ALL',
    onlyLive: false
  };

  const [filters, setFilters] = useState(defaultFilters);

  const uniqueEmployers = useMemo(() => {
    const map = new Map();
    jobs.forEach(job => {
      if (!map.has(job.employerId)) {
        map.set(job.employerId, {
          id: job.employerId,
          name: job.employerName,
          shopName: job.shopName || job.employerName,
          industry: job.industry || 'General Services',
          phone: job.contact.callNumber,
          whatsapp: job.contact.whatsappNumber,
          verified: job.isVerified,
          photo: job.shopPhoto,
          address: job.location.address,
          jobs: jobs.filter(j => j.employerId === job.employerId)
        });
      }
    });
    return Array.from(map.values());
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (filters.onlyLive && !job.isLive) return false;
      if (filters.state && job.location.state !== filters.state) return false;
      if (filters.city && job.location.city !== filters.city) return false;
      if (filters.status && job.status !== filters.status) return false;
      if (filters.category && job.category !== filters.category) return false;
      if (filters.reported === 'YES' && !job.isReported) return false;
      
      if (filters.dateRange !== 'ALL') {
        const jobDate = new Date(job.createdAt);
        const now = new Date();
        const diffDays = (now.getTime() - jobDate.getTime()) / (1000 * 3600 * 24);
        if (filters.dateRange === 'TODAY' && diffDays > 1) return false;
        if (filters.dateRange === 'WEEK' && diffDays > 7) return false;
        if (filters.dateRange === 'MONTH' && diffDays > 30) return false;
      }

      if (filters.search) {
        const s = filters.search.toLowerCase();
        return (job.jobRole || job.title).toLowerCase().includes(s) || 
               job.employerName.toLowerCase().includes(s) || 
               job.shopName?.toLowerCase().includes(s);
      }
      return true;
    });
  }, [jobs, filters]);

  const stats = useMemo(() => {
    const live = jobs.filter(j => j.status === 'APPROVED' && j.isLive).length;
    const pending = jobs.filter(j => j.status === 'PENDING_APPROVAL').length;
    const employers = uniqueEmployers.length;
    const reported = jobs.filter(j => j.isReported).length;
    return { live, pending, employers, reported };
  }, [jobs, uniqueEmployers]);

  const addLog = (details: string, entityType: any, entityId: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      adminId: 'super-admin',
      adminName: 'Super Admin',
      action: 'CREATE',
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      details
    };
    const updated = [newLog, ...logs];
    setLogs(updated);
    localStorage.setItem('nearbykaam_admin_logs', JSON.stringify(updated));
  };

  const renderAdminHeader = () => (
    <div className="bg-slate-900 px-6 pt-12 pb-6 border-b border-slate-800 sticky top-0 z-50">
      <div className="flex justify-between items-start mb-6">
        <div className="text-left">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <i className="fa-solid fa-bolt-lightning text-yellow-400"></i>
            Powerhouse Admin
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Total System Authority</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCreateModal('JOB')} className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white active:scale-95 shadow-lg shadow-indigo-500/20">
            <i className="fa-solid fa-plus"></i>
          </button>
          <button onClick={onLogout} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white active:scale-95 border border-white/20">
            <i className="fa-solid fa-right-from-bracket text-xs"></i>
          </button>
        </div>
      </div>
      
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {[
          { id: 'OVERVIEW', icon: 'fa-chart-pie', label: 'Overview' },
          { id: 'JOBS', icon: 'fa-clipboard-list', label: 'Jobs' },
          { id: 'EMPLOYERS', icon: 'fa-shop', label: 'Employers' },
          { id: 'WORKERS', icon: 'fa-users', label: 'Workers' },
          { id: 'ADMINS', icon: 'fa-user-shield', label: 'Staff' },
          { id: 'LOGS', icon: 'fa-list-ul', label: 'Audit' }
        ].map(mod => (
          <button
            key={mod.id}
            onClick={() => setActiveModule(mod.id as AdminModule)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2 ${
              activeModule === mod.id 
                ? 'bg-white text-slate-900 border-white shadow-lg scale-105' 
                : 'bg-slate-800 text-slate-400 border-slate-700 active:scale-95'
            }`}
          >
            <i className={`fa-solid ${mod.icon}`}></i> {mod.label}
          </button>
        ))}
      </div>
    </div>
  );

  /**
   * Renders the filter panel for job postings
   */
  const renderFilterPanel = () => (
    <div className="bg-white border-b border-slate-200 p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-left block">State</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-600"
            value={filters.state}
            onChange={e => setFilters({...filters, state: e.target.value, city: ''})}
          >
            <option value="">All States</option>
            {Object.keys(STATES_AND_CITIES).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-left block">City</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-600"
            value={filters.city}
            onChange={e => setFilters({...filters, city: e.target.value})}
            disabled={!filters.state}
          >
            <option value="">All Cities</option>
            {filters.state && STATES_AND_CITIES[filters.state].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-left block">Status</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-600"
            value={filters.status}
            onChange={e => setFilters({...filters, status: e.target.value as JobStatus})}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-left block">Category</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-600"
            value={filters.category}
            onChange={e => setFilters({...filters, category: e.target.value as JobCategory})}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <button 
          onClick={() => setFilters(defaultFilters)}
          className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
        >
          Reset Filters
        </button>
        <button 
          onClick={() => setIsFilterOpen(false)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  const renderEmployerDetailModal = () => {
    if (!selectedEmployer) return null;
    return (
      <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
         <div className="bg-white w-full max-w-lg rounded-[40px] flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-slate-900 shrink-0">
               <div className="text-left">
                 <h2 className="text-xl font-black text-white leading-none">{selectedEmployer.shopName}</h2>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Master Business Audit</p>
               </div>
               <button onClick={() => setSelectedEmployer(null)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90"><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar text-left">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Registered Owner</p>
                     <p className="text-sm font-black text-slate-900">{selectedEmployer.name}</p>
                  </div>
                  <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100">
                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Industry Focus</p>
                     <p className="text-sm font-black text-indigo-700">{selectedEmployer.industry}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Identity Verification</h4>
                  <div className="bg-white border-2 border-slate-100 p-5 rounded-[32px] flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedEmployer.verified ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                           <i className={`fa-solid ${selectedEmployer.verified ? 'fa-check-double' : 'fa-hourglass-half'}`}></i>
                        </div>
                        <span className="text-xs font-black uppercase text-slate-700">{selectedEmployer.verified ? 'Verified Merchant' : 'Verification Pending'}</span>
                     </div>
                     {!selectedEmployer.verified && (
                       <button onClick={() => { onVerifyEmployer(selectedEmployer.id); setSelectedEmployer({...selectedEmployer, verified: true}); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all">Verify Now</button>
                     )}
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Business Reach</h4>
                  <div className="bg-slate-50 p-6 rounded-[32px] space-y-4 border border-slate-200">
                     <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Primary Contact</span>
                        <a href={`tel:${selectedEmployer.phone}`} className="text-xs font-black text-indigo-600 underline underline-offset-4">{selectedEmployer.phone}</a>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase">WhatsApp Auth</span>
                        <a href={`https://wa.me/91${selectedEmployer.whatsapp}`} className="text-xs font-black text-emerald-600 underline underline-offset-4">{selectedEmployer.whatsapp}</a>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Job Postings History ({selectedEmployer.jobs.length})</h4>
                  <div className="space-y-3">
                     {selectedEmployer.jobs.map((j: Job) => (
                       <div key={j.id} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex justify-between items-center hover:border-indigo-200 transition-colors">
                          <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${CATEGORIES.find(c => c.id === j.category)?.color}`}>
                                <i className={`fa-solid ${CATEGORIES.find(c => c.id === j.category)?.icon} text-sm`}></i>
                             </div>
                             <div>
                                <p className="text-xs font-black text-slate-900 leading-tight">{j.jobRole || j.title}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase mt-0.5">₹{j.salaryAmount} • {j.status}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="text-right">
                                <p className="text-[10px] font-black text-indigo-600 leading-none">{j.callCount}</p>
                                <p className="text-[7px] font-black text-slate-300 uppercase mt-1">Calls</p>
                             </div>
                             <i className="fa-solid fa-chevron-right text-slate-100 text-xs"></i>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Location Profile</h4>
                  <p className="text-xs font-bold text-slate-600 bg-slate-50 p-5 rounded-[32px] border border-slate-200 leading-relaxed shadow-inner">
                     {selectedEmployer.address}
                  </p>
                  {selectedEmployer.photo && (
                    <img src={selectedEmployer.photo.url} className="w-full h-48 object-cover rounded-[32px] border-4 border-white shadow-xl" alt="Store Front" />
                  )}
               </div>
            </div>
            
            <div className="p-6 border-t bg-slate-50 shrink-0 flex gap-3">
               <button onClick={() => setSelectedEmployer(null)} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all">Close Entry</button>
               <button className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-xl active:scale-90 transition-all border border-red-200 shadow-sm"><i className="fa-solid fa-ban"></i></button>
            </div>
         </div>
      </div>
    );
  };

  const renderJobAuditModal = () => {
    if (!selectedJob) return null;
    const cat = CATEGORIES.find(c => c.id === selectedJob.category);
    return (
      <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
         <div className="bg-white w-full max-w-lg rounded-[40px] flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 shrink-0">
               <div className="text-left">
                 <h2 className="text-xl font-black text-slate-900 leading-none">{selectedJob.jobRole || selectedJob.title}</h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Master Job Audit Panel • ID: {selectedJob.id}</p>
               </div>
               <button onClick={() => setSelectedJob(null)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 active:scale-90"><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar text-left">
               <div className="bg-indigo-600 p-6 rounded-[32px] text-white space-y-4 shadow-xl shadow-indigo-200">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Admin Quick Controls</p>
                  <div className="grid grid-cols-2 gap-3">
                     <button onClick={() => { onUpdateStatus(selectedJob.id, 'APPROVED', { isLive: true }); setSelectedJob(null); }} className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-colors">
                        <i className="fa-solid fa-check-circle"></i> Approve & Live
                     </button>
                     <button onClick={() => { onUpdateStatus(selectedJob.id, 'REJECTED'); setSelectedJob(null); }} className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-colors">
                        <i className="fa-solid fa-times-circle"></i> Reject Posting
                     </button>
                     <button className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-colors">
                        <i className="fa-solid fa-pen-to-square"></i> Edit Specs
                     </button>
                     <button onClick={() => { onDelete(selectedJob.id); setSelectedJob(null); }} className="bg-black/20 hover:bg-black/40 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-colors">
                        <i className="fa-solid fa-trash-can"></i> Hard Delete
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status</p>
                     <span className={`text-xs font-black uppercase ${selectedJob.status === 'APPROVED' ? 'text-emerald-600' : 'text-orange-600'}`}>{selectedJob.status}</span>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Salary Grade</p>
                     <p className="text-sm font-black text-indigo-600">₹{selectedJob.salaryAmount} / {selectedJob.salaryType}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Job Specifications</h4>
                  <div className="grid grid-cols-2 gap-3">
                     {[
                        { label: 'Experience', val: selectedJob.experienceLevel || 'Entry Level' },
                        { label: 'Work Mode', val: selectedJob.workMode || 'On-Site' },
                        { label: 'Type', val: selectedJob.employmentType || 'Full Time' },
                        { label: 'Category', val: cat?.label || 'Other' }
                     ].map((item, i) => (
                       <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{item.label}</p>
                          <p className="text-[11px] font-black text-slate-800">{item.val}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Role Description</h4>
                  <div className="bg-slate-50 p-6 rounded-[32px] border-2 border-slate-100 italic text-xs text-slate-600 leading-relaxed shadow-inner">
                     {selectedJob.description || "No specific details provided by the employer."}
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Location Details</h4>
                  <p className="text-xs font-bold text-slate-700 bg-white p-5 rounded-[32px] border border-slate-200 leading-relaxed">
                     {selectedJob.location.address}
                  </p>
                  {selectedJob.shopPhoto && (
                    <img src={selectedJob.shopPhoto.url} className="w-full h-48 object-cover rounded-[32px] border-4 border-white shadow-xl" alt="Workplace" />
                  )}
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Employer Information</h4>
                  <div className="bg-slate-900 p-6 rounded-[32px] text-white flex justify-between items-center shadow-lg">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-indigo-400 text-xl">{selectedJob.employerName[0]}</div>
                        <div>
                           <p className="font-black text-sm">{selectedJob.employerName}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">{selectedJob.contact.callNumber}</p>
                        </div>
                     </div>
                     <button onClick={() => { setSelectedEmployer(uniqueEmployers.find(e => e.id === selectedJob.employerId)); setSelectedJob(null); }} className="text-[9px] font-black uppercase text-indigo-400 border-b border-indigo-400/30">View Business</button>
                  </div>
               </div>
            </div>
            
            <div className="p-6 border-t bg-slate-50 shrink-0">
               <button onClick={() => setSelectedJob(null)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all">Close Audit</button>
            </div>
         </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="p-6 space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => { setFilters({...defaultFilters, onlyLive: true}); setActiveModule('JOBS'); }} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 text-left active:scale-[0.97] transition-all">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4"><i className="fa-solid fa-signal"></i></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Ecosystem</p>
          <p className="text-4xl font-black text-slate-900">{stats.live}</p>
        </button>
        <button onClick={() => { setFilters({...defaultFilters, status: 'PENDING_APPROVAL'}); setActiveModule('JOBS'); }} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 text-left active:scale-[0.97] transition-all">
          <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-4"><i className="fa-solid fa-clock-rotate-left"></i></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Approval Queue</p>
          <p className="text-4xl font-black text-slate-900">{stats.pending}</p>
        </button>
        <div className="bg-slate-900 p-6 rounded-[32px] text-left col-span-2 flex items-center justify-between border-b-4 border-indigo-700 shadow-xl">
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Platform Impact GMV</p>
              <p className="text-3xl font-black text-white">₹4,28,000</p>
           </div>
           <div className="w-14 h-14 bg-indigo-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">
              <i className="fa-solid fa-indian-rupee-sign"></i>
           </div>
        </div>
      </div>
      
      {/* Visual Analytics Sim */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-left">
         <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Regional Job Density</h3>
         <div className="space-y-5">
            {['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu'].map((state, i) => (
              <div key={state} className="space-y-2">
                 <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                    <span>{state}</span>
                    <span>{85 - i * 12}% Fill Rate</span>
                 </div>
                 <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${85 - i * 12}%` }}></div>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 h-full flex flex-col overflow-hidden safe-area-bottom">
      {renderAdminHeader()}
      {isFilterOpen && renderFilterPanel()}
      {renderJobAuditModal()}
      {renderEmployerDetailModal()}

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeModule === 'OVERVIEW' && renderOverview()}
        
        {activeModule === 'JOBS' && (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
             <div className="p-6 bg-white border-b border-slate-100 flex items-center gap-3">
               <div className="flex-1 bg-slate-50 p-1 rounded-2xl flex items-center border border-slate-100">
                 <i className="fa-solid fa-magnifying-glass ml-4 text-slate-400"></i>
                 <input 
                  type="text" 
                  placeholder="Search globally..." 
                  className="bg-transparent flex-1 px-3 py-3 text-sm font-bold outline-none"
                  value={filters.search}
                  onChange={e => setFilters({...filters, search: e.target.value})}
                 />
               </div>
               <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${isFilterOpen ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-white border border-slate-200 text-slate-500'}`}
               >
                 <i className="fa-solid fa-sliders"></i>
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar pb-24">
                {filteredJobs.length === 0 && (
                  <div className="py-20 text-center opacity-30">
                    <i className="fa-solid fa-clipboard-question text-6xl mb-4"></i>
                    <p className="font-black uppercase text-xs tracking-widest">No matching job records</p>
                  </div>
                )}
                {filteredJobs.map(job => {
                  const jobCat = CATEGORIES.find(c => c.id === job.category);
                  return (
                    <div 
                      key={job.id} 
                      onClick={() => setSelectedJob(job)}
                      className="w-full bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between group transition-all hover:shadow-md hover:border-indigo-200 cursor-pointer active:scale-[0.98] text-left"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`shrink-0 w-14 h-14 ${jobCat?.color || 'bg-slate-500'} text-white rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
                          <i className={`fa-solid ${jobCat?.icon || 'fa-briefcase'}`}></i>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-900 text-sm truncate leading-tight">{job.jobRole || job.title}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase truncate mt-0.5">{job.employerName} • {job.location.city || 'Local'}</p>
                          <div className="flex gap-2 mt-2">
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${job.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{job.status}</span>
                             {job.isReported && <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-red-50 text-red-600 uppercase">Flagged</span>}
                          </div>
                        </div>
                      </div>
                      <i className="fa-solid fa-chevron-right text-slate-200 text-xs"></i>
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        {activeModule === 'EMPLOYERS' && (
           <div className="p-6 space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center px-1">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Merchant Database</h3>
                 <button onClick={() => setShowCreateModal('EMPLOYER')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">+ New Merchant</button>
              </div>
              <div className="space-y-4">
                 {uniqueEmployers.map((emp, i) => (
                   <div 
                    key={i} 
                    onClick={() => setSelectedEmployer(emp)}
                    className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between text-left cursor-pointer active:scale-[0.97] hover:border-indigo-100 transition-all group"
                   >
                      <div className="flex items-center gap-4 min-w-0">
                         <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">{emp.shopName[0]}</div>
                         <div className="min-w-0">
                            <h4 className="font-black text-slate-900 text-sm truncate flex items-center gap-2">
                               {emp.shopName} 
                               {emp.verified && <i className="fa-solid fa-circle-check text-blue-500 text-[10px]"></i>}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{emp.name} • {emp.phone}</p>
                         </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                         <span className="text-[8px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase text-slate-500 mb-1">{emp.jobs.length} Postings</span>
                         <i className="fa-solid fa-chevron-right text-slate-100 text-[10px]"></i>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {/* Other modules retained as previous */}
        {activeModule === 'WORKERS' && (
           <div className="p-6 space-y-4 animate-in fade-in duration-300">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest px-1 text-left">Talent Pool</h3>
              <div className="space-y-4">
                 {registeredWorkers.map((worker, i) => (
                   <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between text-left">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-xl font-black">{worker.name[0]}</div>
                         <div>
                            <h4 className="font-black text-slate-900 text-sm">{worker.name}</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{worker.phone} • {worker.preferredJobTitle}</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         {worker.resume.hasAudio && <i className="fa-solid fa-microphone text-indigo-500"></i>}
                         {worker.resume.hasDocument && <i className="fa-solid fa-file-pdf text-red-500"></i>}
                      </div>
                   </div>
                 ))}
                 {registeredWorkers.length === 0 && <p className="text-center py-20 text-slate-300 font-black uppercase text-[10px]">No workers in system</p>}
              </div>
           </div>
        )}

        {activeModule === 'ADMINS' && (
          <div className="p-6 space-y-6 animate-in fade-in duration-300 text-left">
             <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest px-1">Admin Operations Staff</h2>
             <div className="space-y-4">
                {managedAdmins.map((adm, i) => (
                  <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black">ST</div>
                        <div>
                           <h4 className="font-black text-slate-900 text-sm">Operator #{adm.phone.slice(-4)}</h4>
                           <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Access: {adm.permissions?.join(', ') || 'Limited'}</p>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeModule === 'LOGS' && (
           <div className="p-6 space-y-4 animate-in fade-in duration-300 text-left">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest px-1">Global Audit Trail</h3>
              {logs.length === 0 ? (
                <p className="text-center py-20 text-slate-300 font-black uppercase text-[10px]">Trail is clear</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm">
                     <div className="flex justify-between mb-2">
                        <span className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase">{log.entityType} ACTION</span>
                        <span className="text-[8px] font-black text-slate-300 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</span>
                     </div>
                     <p className="text-xs font-bold text-slate-700 leading-tight">{log.details}</p>
                     <p className="text-[9px] font-black text-slate-400 uppercase mt-2">By: {log.adminName}</p>
                  </div>
                ))
              )}
           </div>
        )}
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default AdminView;
