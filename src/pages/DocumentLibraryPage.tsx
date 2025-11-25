import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  FileText, 
  Trash2, 
  Eye, 
  MoreVertical, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  HardDrive
} from 'lucide-react';
import { AnalysisHistoryItem } from '../types/history';

interface DocumentLibraryPageProps {
  analysisHistory: AnalysisHistoryItem[];
  onSelectAnalysis: (item: AnalysisHistoryItem) => void;
  onDeleteAnalysis: (id: string) => void;
  language: 'en' | 'hi';
}

export default function DocumentLibraryPage({
  analysisHistory,
  onSelectAnalysis,
  onDeleteAnalysis,
  language
}: DocumentLibraryPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'risk'>('date');
  const [filterType, setFilterType] = useState<string>('all');

  // Translations
  const t = {
    en: {
      title: 'Document Library',
      subtitle: 'Manage and review your analyzed documents',
      searchPlaceholder: 'Search documents...',
      totalDocuments: 'Total Documents',
      storageUsed: 'Storage Used',
      highRiskDocs: 'High Risk Documents',
      recentActivity: 'Recent Activity',
      uploadDocument: 'Upload Document',
      noDocuments: 'No documents found',
      view: 'View',
      compare: 'Compare',
      delete: 'Delete',
      risk: 'Risk',
      deadlines: 'Deadlines',
      risks: 'Risks'
    },
    hi: {
      title: 'दस्तावेज़ पुस्तकालय',
      subtitle: 'अपने विश्लेषण किए गए दस्तावेज़ों का प्रबंधन और समीक्षा करें',
      searchPlaceholder: 'दस्तावेज़ खोजें...',
      totalDocuments: 'कुल दस्तावेज़',
      storageUsed: 'भंडारण उपयोग',
      highRiskDocs: 'उच्च जोखिम वाले दस्तावेज़',
      recentActivity: 'हाल की गतिविधि',
      uploadDocument: 'दस्तावेज़ अपलोड करें',
      noDocuments: 'कोई दस्तावेज़ नहीं मिला',
      view: 'देखें',
      compare: 'तुलना करें',
      delete: 'हटाएं',
      risk: 'जोखिम',
      deadlines: 'समय सीमा',
      risks: 'जोखिम'
    }
  }[language];

  // Calculate Stats
  const stats = useMemo(() => {
    const totalDocs = analysisHistory.length;
    // Mock storage calculation (approx 2KB per doc metadata + content length)
    const storageBytes = analysisHistory.reduce((acc, item) => acc + (item.originalContent?.length || 0) + 2000, 0);
    const storageUsed = storageBytes > 1024 * 1024 
      ? `${(storageBytes / (1024 * 1024)).toFixed(2)} MB` 
      : `${(storageBytes / 1024).toFixed(2)} KB`;
    
    const highRiskCount = analysisHistory.filter(item => 
      item.analysis?.risks?.some((r: any) => r.severity === 'high')
    ).length;

    return { totalDocs, storageUsed, highRiskCount };
  }, [analysisHistory]);

  // Filter and Sort Logic
  const filteredDocs = useMemo(() => {
    return analysisHistory
      .filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              doc.metadata?.documentType?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || doc.metadata?.documentType === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        } else {
          // Sort by risk count (descending)
          const riskA = a.analysis?.risks?.length || 0;
          const riskB = b.analysis?.risks?.length || 0;
          return riskB - riskA;
        }
      });
  }, [analysisHistory, searchQuery, sortBy, filterType]);

  const getRiskBadgeColor = (risks: any[]) => {
    const hasHigh = risks?.some(r => r.severity === 'high');
    const hasMedium = risks?.some(r => r.severity === 'medium');
    if (hasHigh) return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    if (hasMedium) return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
    return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
  };

  const getRiskLabel = (risks: any[]) => {
    const hasHigh = risks?.some(r => r.severity === 'high');
    const hasMedium = risks?.some(r => r.severity === 'medium');
    if (hasHigh) return 'High Risk';
    if (hasMedium) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        {/* Upload button could go here if needed, but it's in the sidebar */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          icon={<FileText className="w-5 h-5 text-blue-500" />}
          label={t.totalDocuments}
          value={stats.totalDocs}
          color="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatsCard 
          icon={<HardDrive className="w-5 h-5 text-green-500" />}
          label={t.storageUsed}
          value={stats.storageUsed}
          color="bg-green-50 dark:bg-green-900/20"
        />
        <StatsCard 
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          label={t.highRiskDocs}
          value={stats.highRiskCount}
          color="bg-red-50 dark:bg-red-900/20"
        />
        <StatsCard 
          icon={<Clock className="w-5 h-5 text-purple-500" />}
          label={t.recentActivity}
          value={stats.totalDocs} // Just using total docs as activity proxy for now
          color="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      {/* Controls Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Documents</option>
            <option value="Contract">Contracts</option>
            <option value="Agreement">Agreements</option>
            <option value="Lease">Leases</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'risk')}
            className="px-3 py-2 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="date">Sort by Date</option>
            <option value="risk">Sort by Risk</option>
          </select>

          <div className="flex items-center border border-input rounded-lg p-1 bg-background">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Documents Grid/List */}
      {filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FileText className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg">{t.noDocuments}</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
          <AnimatePresence>
            {filteredDocs.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`group relative bg-card hover:shadow-lg transition-all duration-300 rounded-xl border border-border overflow-hidden ${viewMode === 'list' ? 'flex items-center p-4 gap-6' : 'p-5 flex flex-col'}`}
              >
                {/* Icon & Title */}
                <div className={`flex items-start gap-4 ${viewMode === 'list' ? 'flex-1' : 'mb-4'}`}>
                  <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate pr-2" title={doc.title}>
                      {doc.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {doc.metadata?.documentType || 'Unknown Type'} • {(doc.originalContent?.length / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                {/* Badges & Stats */}
                <div className={`flex flex-wrap items-center gap-2 ${viewMode === 'list' ? 'w-64 justify-center' : 'mb-4'}`}>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskBadgeColor(doc.analysis?.risks)}`}>
                    {getRiskLabel(doc.analysis?.risks)}
                  </span>
                  {doc.analysis?.timeline?.overall?.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                      {t.deadlines}
                    </span>
                  )}
                </div>

                {/* Meta Info */}
                <div className={`flex items-center gap-4 text-xs text-muted-foreground ${viewMode === 'list' ? 'w-48' : 'mb-6'}`}>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(doc.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{doc.analysis?.risks?.length || 0} {t.risks}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className={`flex items-center gap-2 ${viewMode === 'list' ? '' : 'mt-auto pt-4 border-t border-border'}`}>
                  <button 
                    onClick={() => onSelectAnalysis(doc)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    {t.view}
                  </button>
                  <button 
                    onClick={() => onDeleteAnalysis(doc.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title={t.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function StatsCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
  return (
    <div className={`p-4 rounded-xl border border-border flex items-center gap-4 ${color}`}>
      <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
