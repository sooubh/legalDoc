import React from 'react'
import { motion } from 'framer-motion'
import {
  AiOutlineFileText,
  AiOutlineWarning,
  AiOutlineClockCircle,
  AiOutlineCheckCircle
} from 'react-icons/ai'

// Timeline event interface
export interface TimelineEvent {
  title: string
  subtitle: string
  date: string
  description: string
  color: string
  icon: 'file' | 'clock' | 'warning' | 'check'
}

// Timeline data structure
export interface TimelineData {
  court: TimelineEvent[]
  receiver: TimelineEvent[]
  overall: TimelineEvent[]
}

interface LegalNoticeTimelinePOVProps {
  pov?: 'court' | 'receiver' | 'overall'
  lineColor?: string
  timelineData?: TimelineData
  isLoading?: boolean
}

const iconMap = {
  file: <AiOutlineFileText />,
  clock: <AiOutlineClockCircle />,
  warning: <AiOutlineWarning />,
  check: <AiOutlineCheckCircle />
}

// Default timeline data (fallback)
const defaultTimelineData: TimelineData = {
  court: [
    { title: 'Notice Filed', subtitle: 'Legal Submission', date: '2025-10-10', description: 'The legal notice is filed in court for review.', color: 'bg-blue-600', icon: 'file' },
    { title: 'Court Hearing Scheduled', subtitle: 'First Hearing', date: '2025-10-15', description: 'The court schedules the first hearing for the case.', color: 'bg-blue-500', icon: 'clock' },
    { title: 'Evidence Submitted', subtitle: 'Supporting Documents', date: '2025-10-17', description: 'All evidence submitted to the court for review.', color: 'bg-blue-400', icon: 'file' },
    { title: 'Preliminary Decision', subtitle: 'Court Decision', date: '2025-10-20', description: 'Court gives a preliminary ruling on the case.', color: 'bg-blue-300', icon: 'check' },
    { title: 'Final Verdict', subtitle: 'Judgement Passed', date: '2025-10-25', description: 'Court delivers the final verdict.', color: 'bg-blue-700', icon: 'check' }
  ],
  receiver: [
    { title: 'Notice Received', subtitle: 'Acknowledgement Pending', date: '2025-10-11', description: 'Receiver gets the legal notice and is notified to respond.', color: 'bg-red-600', icon: 'file' },
    { title: 'Reminder Received', subtitle: 'Second Warning', date: '2025-10-13', description: 'Receiver gets a reminder due to non-response.', color: 'bg-orange-500', icon: 'warning' },
    { title: 'Response Submitted', subtitle: 'Compliance Action', date: '2025-10-16', description: 'Receiver submits required documents in response to notice.', color: 'bg-yellow-500', icon: 'file' },
    { title: 'Hearing Attendance', subtitle: 'Court Appearance', date: '2025-10-20', description: 'Receiver attends the court hearing as scheduled.', color: 'bg-red-400', icon: 'clock' },
    { title: 'Action Completed', subtitle: 'Final Compliance', date: '2025-10-24', description: 'Receiver completes all required actions as per legal notice.', color: 'bg-green-600', icon: 'check' }
  ],
  overall: [
    { title: 'Case Initiated', subtitle: 'Legal Process Started', date: '2025-10-10', description: 'Case is initiated after sending the notice.', color: 'bg-gray-600', icon: 'file' },
    { title: 'Follow-up Actions', subtitle: 'Multiple Reminders', date: '2025-10-13', description: 'Follow-ups and reminders are sent to ensure compliance.', color: 'bg-gray-500', icon: 'warning' },
    { title: 'Partial Compliance', subtitle: 'Intermediate Actions', date: '2025-10-17', description: 'Some actions completed by receiver while others pending.', color: 'bg-gray-400', icon: 'clock' },
    { title: 'Final Enforcement', subtitle: 'Completion of Legal Action', date: '2025-10-24', description: 'Final enforcement completed and case closed successfully.', color: 'bg-gray-700', icon: 'check' },
    { title: 'Closure Report', subtitle: 'Summary Document', date: '2025-10-25', description: 'Comprehensive report submitted summarizing the entire case process.', color: 'bg-gray-800', icon: 'file' }
  ]
}

export default function LegalNoticeTimelinePOV({
  pov = 'overall',
  lineColor = 'bg-gray-300',
  timelineData,
  isLoading = false
}: LegalNoticeTimelinePOVProps) {
  const data = timelineData || defaultTimelineData
  const events = data[pov] || []

  if (isLoading) {
    return (
      <div className="relative py-10 max-w-5xl mx-auto bg-gray-50 p-6 rounded-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading timeline...</span>
        </div>
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="relative py-10 max-w-5xl mx-auto bg-gray-50 p-6 rounded-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 text-lg">No timeline data available</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative py-8 px-4 sm:px-6 max-w-5xl mx-auto bg-gray-50 rounded-2xl overflow-hidden">
      {/* Timeline line */}
      <div
        className={`absolute left-5 sm:left-12 top-4 bottom-4 w-1 ${lineColor} rounded-full`}
        aria-hidden
      />

      <ol className="space-y-10 sm:space-y-12 pl-12 sm:pl-24">
        {events.map((ev, idx) => (
          <li key={idx} className="relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 bg-white rounded-2xl shadow border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-500 w-full"
            >
              {/* Icon bubble */}
              <div className="absolute -left-9 sm:-left-16 top-4">
                <div
                  className={`flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-full ring-4 ring-white shadow-md ${ev.color ?? 'bg-indigo-500'}`}
                  aria-hidden
                >
                  <span className="text-white text-lg sm:text-2xl">
                    {iconMap[ev.icon]}
                  </span>
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1 w-full">
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="font-bold text-lg sm:text-2xl text-gray-900 tracking-wide break-words">
                    {ev.title}
                  </h3>
                  {ev.date && (
                    <time className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                      {ev.date}
                    </time>
                  )}
                </header>
                {ev.subtitle && (
                  <p className="text-blue-700 mt-2 font-semibold text-sm sm:text-lg">
                    {ev.subtitle}
                  </p>
                )}
                {ev.description && (
                  <p className="mt-2 text-gray-700 leading-relaxed text-sm sm:text-base break-words">
                    {ev.description}
                  </p>
                )}
              </div>
            </motion.div>
          </li>
        ))}
      </ol>
    </div>
  )
}
