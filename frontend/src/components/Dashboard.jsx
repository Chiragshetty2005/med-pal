import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Activity, ScanLine, Calendar, Shield, ChevronDown,
  AlertTriangle, CheckCircle, Info, Clock, User, ArrowLeft, Search,
  Stethoscope, Heart, Loader2, FileDown
} from 'lucide-react';
import { getReports, downloadReport } from '../services/reportsApi';
import { useAuth } from '../context/authContext';

export default function Dashboard({ onBack }) {
  const { user, token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'symptom' | 'image'
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReports(token);
      setReports(data.reports || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId) => {
    setDownloadingId(reportId);
    try {
      await downloadReport(reportId, token);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Filter & search
  const filteredReports = reports.filter(r => {
    if (filter !== 'all' && r.type !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesPatient = r.patientName?.toLowerCase().includes(term);
      const matchesType = r.type?.toLowerCase().includes(term);
      const matchesPrediction = r.result?.prediction?.toLowerCase().includes(term);
      const matchesConditions = r.result?.PossibleConditions?.some(c => c.toLowerCase().includes(term));
      return matchesPatient || matchesType || matchesPrediction || matchesConditions;
    }
    return true;
  });

  const getSeverity = (report) => {
    return report.result?.Severity || report.result?.severity || 'N/A';
  };

  const getSeverityConfig = (severity) => {
    const s = severity?.toLowerCase();
    if (s === 'emergency' || s === 'high') return {
      color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20',
      glow: 'shadow-red-500/10', icon: AlertTriangle, dot: 'bg-red-500'
    };
    if (s === 'warning' || s === 'medium') return {
      color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
      glow: 'shadow-amber-500/10', icon: Info, dot: 'bg-amber-500'
    };
    return {
      color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
      glow: 'shadow-emerald-500/10', icon: CheckCircle, dot: 'bg-emerald-500'
    };
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getReportSummary = (report) => {
    if (report.type === 'symptom') {
      return report.result?.PossibleConditions?.[0] || report.inputData?.symptoms || 'Symptom analysis';
    }
    return report.result?.prediction || 'Image analysis';
  };

  const isDoctor = user?.role === 'doctor';

  return (
    <motion.div
      className="min-h-[80vh] w-full max-w-6xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ambient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div>
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-400 text-sm mb-3 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Home
            </button>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {isDoctor ? (
                <>All Patient <span className="text-gradient">Reports</span></>
              ) : (
                <>My <span className="text-gradient">Reports</span></>
              )}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isDoctor
                ? `Viewing all patient reports • ${reports.length} total`
                : `Your personal health analysis history • ${reports.length} reports`
              }
            </p>
          </div>

          {/* Role badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border ${
            isDoctor
              ? 'bg-purple-500/10 border-purple-500/20 text-purple-300'
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
          }`}>
            {isDoctor ? <Stethoscope className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
            {isDoctor ? 'Doctor View' : 'Patient View'}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 mb-6"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              id="dashboard-search"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/40 text-sm transition-all"
            />
          </div>

          {/* Type filter */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All', icon: FileText },
              { key: 'symptom', label: 'Symptom', icon: Activity },
              { key: 'image', label: 'Image', icon: ScanLine },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  filter === f.key
                    ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                    : 'bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-400 hover:border-white/[0.12]'
                }`}
              >
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <motion.div
            className="flex flex-col items-center justify-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-gray-500 text-sm mt-4">Loading reports...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            className="flex flex-col items-center justify-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertTriangle className="w-12 h-12 text-red-400/60 mb-4" />
            <p className="text-red-400/80 text-sm">{error}</p>
            <button
              onClick={fetchReports}
              className="mt-4 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        ) : filteredReports.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full" />
              <FileText className="w-16 h-16 text-gray-700 relative z-10" />
            </div>
            <h3 className="text-lg font-semibold text-gray-400 mb-1">No reports yet</h3>
            <p className="text-gray-600 text-sm text-center max-w-xs">
              {searchTerm || filter !== 'all'
                ? 'No reports match your search criteria'
                : 'Run a health analysis to see your reports here'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={onBack}
                className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all"
              >
                Start Analysis
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredReports.map((report, index) => {
                const severity = getSeverity(report);
                const config = getSeverityConfig(severity);
                const SeverityIcon = config.icon;

                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className={`group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden hover:border-white/[0.12] shadow-lg ${config.glow}`}
                  >
                    {/* Subtle severity accent line at top */}
                    <div className={`absolute top-0 left-0 right-0 h-[2px] ${config.bg} opacity-60`}>
                      <div className={`h-full w-24 ${config.dot} opacity-40`} />
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Type Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center`}>
                          {report.type === 'symptom' ? (
                            <Activity className={`w-5 h-5 ${config.color}`} />
                          ) : (
                            <ScanLine className={`w-5 h-5 ${config.color}`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="text-white font-semibold text-sm truncate">
                                {getReportSummary(report)}
                              </h3>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                {/* Type badge */}
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                  {report.type === 'symptom' ? (
                                    <><Activity className="w-3 h-3" /> Symptom Analysis</>
                                  ) : (
                                    <><ScanLine className="w-3 h-3" /> Image Analysis</>
                                  )}
                                </span>

                                {/* Date */}
                                <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(report.createdAt)}
                                </span>

                                {/* Time */}
                                <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(report.createdAt)}
                                </span>

                                {/* Patient name (doctor view) */}
                                {isDoctor && (
                                  <span className="inline-flex items-center gap-1 text-xs text-indigo-400/70">
                                    <User className="w-3 h-3" />
                                    {report.patientName}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Severity Badge */}
                            <div className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${config.bg} border ${config.border}`}>
                              <SeverityIcon className={`w-3.5 h-3.5 ${config.color}`} />
                              <span className={`text-xs font-semibold ${config.color}`}>
                                {severity}
                              </span>
                            </div>
                          </div>

                          {/* Preview details */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {report.result?.RiskScore !== undefined && (
                              <span className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-400">
                                Risk: {report.result.RiskScore}/100
                              </span>
                            )}
                            {report.result?.confidence !== undefined && (
                              <span className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-400">
                                Confidence: {(report.result.confidence * 100).toFixed(0)}%
                              </span>
                            )}
                            {report.result?.PrimaryDomain && (
                              <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-indigo-400/70">
                                {report.result.PrimaryDomain}
                              </span>
                            )}
                            {report.result?.type && (
                              <span className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-400">
                                {report.result.type}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Download Button */}
                        <div className="flex-shrink-0">
                          <motion.button
                            onClick={() => handleDownload(report.id)}
                            disabled={downloadingId === report.id}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all text-sm font-medium disabled:opacity-50"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {downloadingId === report.id ? (
                              <>
                                <motion.div
                                  className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                                <span className="hidden sm:inline">Generating...</span>
                              </>
                            ) : (
                              <>
                                <FileDown className="w-4 h-4" />
                                <span className="hidden sm:inline">Download PDF</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Stats footer */}
        {!loading && filteredReports.length > 0 && (
          <motion.div
            className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { label: 'Total Reports', value: reports.length, icon: FileText, color: 'text-indigo-400' },
              { label: 'Symptom', value: reports.filter(r => r.type === 'symptom').length, icon: Activity, color: 'text-violet-400' },
              { label: 'Image', value: reports.filter(r => r.type === 'image').length, icon: ScanLine, color: 'text-cyan-400' },
              { label: 'High Severity', value: reports.filter(r => {
                const s = getSeverity(r).toLowerCase();
                return s === 'emergency' || s === 'high';
              }).length, icon: AlertTriangle, color: 'text-red-400' },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
