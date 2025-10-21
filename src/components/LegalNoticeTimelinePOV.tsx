import React from 'react'
import { motion } from 'framer-motion'
import { AiOutlineFileText, AiOutlineWarning, AiOutlineClockCircle, AiOutlineCheckCircle } from 'react-icons/ai'

// Timeline event interface for AI-generated data
export interface TimelineEvent {
  title: string
  subtitle: string
  date: string
  description: string
  color: string
  icon: 'file' | 'clock' | 'warning' | 'check'
}

// Timeline data structure for different POVs
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
    <div className="relative py-10 max-w-5xl mx-auto bg-gray-50 p-6 rounded-2xl">
      <div className={`absolute left-12 top-4 bottom-4 w-1 ${lineColor} rounded-full`} aria-hidden />
      <ol className="space-y-12 pl-24">
        {events.map((ev, idx) => (
          <li key={idx} className="relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="flex items-start gap-8 bg-white shadow-2xl rounded-2xl p-8 border border-gray-200 hover:shadow-3xl transition-all duration-500"
            >
              <div className="absolute -left-16 top-4">
                <div className={`flex h-20 w-20 items-center justify-center rounded-full ring-4 ring-white shadow-xl ${ev.color ?? 'bg-indigo-500'}`} aria-hidden>
                  {iconMap[ev.icon] ? <span className="w-10 h-10 flex items-center justify-center text-white text-3xl">{iconMap[ev.icon]}</span> : <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="6" fill="currentColor" /></svg>}
                </div>
              </div>

              <div className="flex-1">
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="font-extrabold text-3xl text-gray-900 tracking-wide">{ev.title}</h3>
                  {ev.date && <time className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">{ev.date}</time>}
                </header>
                {ev.subtitle && <p className="text-red-700 mt-2 font-semibold text-xl">{ev.subtitle}</p>}
                {ev.description && <p className="mt-3 text-gray-700 leading-relaxed text-lg">{ev.description}</p>}
              </div>
            </motion.div>
          </li>
        ))}
      </ol>
    </div>
  )
}
