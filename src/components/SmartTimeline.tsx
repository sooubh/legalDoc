import { motion } from 'framer-motion'
import {
  AiOutlineCalendar,
  AiOutlineExclamationCircle
} from 'react-icons/ai'
import { POVTimelineEvent, POVTimelineData } from '../types/legal'
import { generateICS, downloadICS } from '../utils/calendarUtils'

interface SmartTimelineProps {
  pov?: 'court' | 'receiver' | 'overall'
  lineColor?: string
  timelineData?: POVTimelineData
  isLoading?: boolean
}

// Emoji map for event types
const emojiMap: Record<string, string> = {
  file: '📄',
  clock: '⏰',
  warning: '⚠️',
  check: '✅',
  money: '💰',
  calendar: '📅',
  contract: '📜',
  alert: '🚨'
}

// Default timeline data with user provided examples
const defaultTimelineData: POVTimelineData = {
  court: [
     { title: 'Notice Filed', subtitle: 'Legal Submission', date: '2025-10-10', description: 'The legal notice is filed in court for review.', color: 'from-blue-500 to-blue-600', icon: 'contract', type: 'event' },
     { title: 'Court Hearing', subtitle: 'First Hearing', date: '2025-10-15', description: 'The court schedules the first hearing for the case.', color: 'from-indigo-500 to-indigo-600', icon: 'file', type: 'event' }
  ],
  receiver: [
    { 
      title: 'Rent payment', 
      subtitle: '10th of every month', 
      date: '2025-11-10', 
      description: 'Regular monthly rent payment of ₹32,000.', 
      color: 'from-rose-500 to-red-600', 
      icon: 'money', 
      type: 'deadline',
      consequence: 'Late fee of ₹500 per day',
      timeRemaining: '5 days left'
    },
    { 
      title: 'Renewal notice', 
      subtitle: '30 days before June 30, 2026', 
      date: '2026-05-31', 
      description: 'Submit notice for lease renewal.', 
      color: 'from-amber-500 to-orange-600', 
      icon: 'warning', 
      type: 'deadline',
      consequence: 'Lease may not be renewed',
      timeRemaining: '6 months left'
    },
    { 
      title: 'Termination notice', 
      subtitle: '45 days before desired termination date', 
      date: '2026-05-15', 
      description: 'Submit notice for lease termination.', 
      color: 'from-red-600 to-red-700', 
      icon: 'alert', 
      type: 'deadline',
      consequence: 'Potential breach of contract and financial penalties',
      timeRemaining: '5.5 months left'
    },
    { 
      title: 'Security deposit refund', 
      subtitle: '14 days after inspection upon termination', 
      date: '2026-07-14', 
      description: 'Refund of security deposit after inspection.', 
      color: 'from-emerald-500 to-green-600', 
      icon: 'money', 
      type: 'deadline',
      consequence: 'Potential legal action for non-compliance',
      timeRemaining: '7 months left'
    },
    { 
      title: 'Pay monthly rent', 
      subtitle: '10th of every month', 
      date: 'Recurring', 
      description: 'Tenant obligation to pay monthly rent of ₹32,000.', 
      color: 'from-blue-500 to-cyan-600', 
      icon: 'contract', 
      type: 'obligation',
      consequence: 'Obligation not fulfilled',
      timeRemaining: 'Recurring'
    }
  ],
  overall: [
    { 
      title: 'Rent payment', 
      subtitle: '10th of every month', 
      date: '2025-11-10', 
      description: 'Regular monthly rent payment of ₹32,000.', 
      color: 'from-rose-500 to-red-600', 
      icon: 'money', 
      type: 'deadline',
      consequence: 'Late fee of ₹500 per day',
      timeRemaining: '5 days left'
    },
    { 
      title: 'Renewal notice', 
      subtitle: '30 days before June 30, 2026', 
      date: '2026-05-31', 
      description: 'Submit notice for lease renewal.', 
      color: 'from-amber-500 to-orange-600', 
      icon: 'warning', 
      type: 'deadline',
      consequence: 'Lease may not be renewed',
      timeRemaining: '6 months left'
    },
    { 
      title: 'Termination notice', 
      subtitle: '45 days before desired termination date', 
      date: '2026-05-15', 
      description: 'Submit notice for lease termination.', 
      color: 'from-red-600 to-red-700', 
      icon: 'alert', 
      type: 'deadline',
      consequence: 'Potential breach of contract and financial penalties',
      timeRemaining: '5.5 months left'
    },
    { 
      title: 'Security deposit refund', 
      subtitle: '14 days after inspection upon termination', 
      date: '2026-07-14', 
      description: 'Refund of security deposit after inspection.', 
      color: 'from-emerald-500 to-green-600', 
      icon: 'money', 
      type: 'deadline',
      consequence: 'Potential legal action for non-compliance',
      timeRemaining: '7 months left'
    },
    { 
      title: 'Pay monthly rent', 
      subtitle: '10th of every month', 
      date: 'Recurring', 
      description: 'Tenant obligation to pay monthly rent of ₹32,000.', 
      color: 'from-blue-500 to-cyan-600', 
      icon: 'contract', 
      type: 'obligation',
      consequence: 'Obligation not fulfilled',
      timeRemaining: 'Recurring'
    },
    { 
      title: 'Refund Security Deposit', 
      subtitle: '14 days after inspection', 
      date: 'Conditional', 
      description: 'Landlord: Refund the security deposit within 14 days after inspection upon termination.', 
      color: 'from-purple-500 to-indigo-600', 
      icon: 'check', 
      type: 'obligation',
      consequence: 'Obligation not fulfilled',
      timeRemaining: 'Conditional'
    }
  ]
}

export default function SmartTimeline({
  pov = 'overall',
  lineColor = 'bg-gray-200 dark:bg-slate-700',
  timelineData,
  isLoading = false
}: SmartTimelineProps) {
  const data = timelineData || defaultTimelineData
  const events = data[pov] || []

  const handleExportCalendar = () => {
    if (events.length === 0) return;
    const icsContent = generateICS(events);
    downloadICS(`legal-timeline-${pov}.ics`, icsContent);
  };

  if (isLoading) {
    return (
      <div className="relative py-10 max-w-5xl mx-auto bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/20 dark:border-slate-700/30">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-slate-400">Loading timeline...</span>
        </div>
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="relative py-10 max-w-5xl mx-auto bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/20 dark:border-slate-700/30">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-slate-400 text-lg">No timeline data available</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative py-8 px-4 sm:px-6 max-w-5xl mx-auto bg-white/30 dark:bg-slate-900/30 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 dark:border-slate-700/30 shadow-xl">
      
      {/* Header with Export Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 px-4 sm:px-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-slate-400">
            Smart Timeline
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-2 font-medium">
            Track deadlines, obligations, and key events.
          </p>
        </div>
        <button
          onClick={handleExportCalendar}
          className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 font-medium"
          title="Export events to your calendar"
        >
          <AiOutlineCalendar className="text-xl group-hover:scale-110 transition-transform duration-300" />
          <span>Export to Calendar</span>
        </button>
      </div>

      {/* Timeline line */}
      <div
        className={`absolute left-8 sm:left-16 top-40 bottom-12 w-0.5 ${lineColor} rounded-full opacity-50`}
        aria-hidden
      />

      <ol className="space-y-10 pl-16 sm:pl-32 pr-4">
        {events.map((ev, idx) => {
          const isDeadline = ev.type === 'deadline';
          const isObligation = ev.type === 'obligation';
          
          // Determine card styles based on type
          const cardStyles = isDeadline 
            ? 'bg-gradient-to-br from-red-50/90 to-rose-50/90 dark:from-red-900/20 dark:to-rose-900/20 border-red-100/50 dark:border-red-800/30' 
            : isObligation 
              ? 'bg-gradient-to-br from-blue-50/90 to-cyan-50/90 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-100/50 dark:border-blue-800/30' 
              : 'bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-slate-800/40 dark:to-slate-900/40 border-white/40 dark:border-slate-700/30';

          return (
            <li key={idx} className="relative group">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative flex flex-col sm:flex-row items-start gap-5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 w-full p-6 border backdrop-blur-sm ${cardStyles}`}
              >
                {/* Icon bubble */}
                <div className="absolute -left-[3.25rem] sm:-left-[5.25rem] top-6 z-10">
                  <div
                    className={`flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900 shadow-lg bg-gradient-to-br ${ev.color ?? 'from-indigo-500 to-purple-600'} transform group-hover:scale-110 transition-transform duration-300`}
                    aria-hidden
                  >
                    <span className="text-2xl sm:text-3xl filter drop-shadow-md">
                      {emojiMap[ev.icon] || '📌'}
                    </span>
                  </div>
                </div>

                {/* Connector Line Highlight */}
                <div className={`absolute -left-[3.25rem] sm:-left-[5.25rem] top-[3.5rem] w-8 sm:w-12 h-0.5 bg-gradient-to-r ${ev.color ?? 'from-indigo-500 to-purple-600'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Content */}
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    {ev.date && (
                      <time className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm
                        ${isDeadline ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : isObligation ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'}
                      `}>
                        {ev.date}
                      </time>
                    )}
                    {ev.timeRemaining && (
                      <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 bg-white/60 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-slate-700 backdrop-blur-sm">
                        {ev.timeRemaining}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-xl text-gray-900 dark:text-slate-100 tracking-tight leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {ev.title}
                  </h3>
                  
                  {ev.subtitle && (
                    <p className={`mt-1 font-medium text-sm ${isDeadline ? 'text-red-600 dark:text-red-400' : isObligation ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`}>
                      {ev.subtitle}
                    </p>
                  )}

                  {ev.description && (
                    <p className="mt-3 text-gray-600 dark:text-slate-300 leading-relaxed text-sm">
                      {ev.description}
                    </p>
                  )}

                  {/* Consequence Section */}
                  {ev.consequence && (
                    <div className={`mt-4 p-3.5 rounded-xl flex items-start gap-3 text-sm border backdrop-blur-sm transition-colors duration-300
                      ${isDeadline ? 'bg-red-100/40 dark:bg-red-900/20 border-red-200/50 dark:border-red-800/30 text-red-800 dark:text-red-200' : 'bg-blue-100/40 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/30 text-blue-800 dark:text-blue-200'}
                    `}>
                      <AiOutlineExclamationCircle className="text-xl flex-shrink-0 mt-0.5 opacity-80" />
                      <div>
                        <span className="font-bold block text-xs uppercase opacity-70 mb-1 tracking-wider">Consequence</span>
                        <span className="font-medium leading-snug">{ev.consequence}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
