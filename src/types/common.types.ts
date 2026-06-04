export type NotificationType = 'lead_assigned' | 'call_missed' | 'followup_due' | 'visit_scheduled' | 'property_shared' | 'attendance_issue' | 'post_due' | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string | null
  read: boolean
  link: string | null
  created_at: string
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent'
export type TaskStatus = 'Pending' | 'In Progress' | 'Done' | 'Snoozed'

export interface Task {
  id: string
  org_id: string
  assigned_to: string
  created_by: string | null
  lead_id: string | null
  title: string
  description: string | null
  due_date: string | null
  priority: TaskPriority
  status: TaskStatus
  created_at: string
  updated_at: string
}

export type CallStatus = 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'no-answer' | 'busy'
export type CallOutcome = 'Answered' | 'No Answer' | 'Busy' | 'Callback Requested' | 'Not Interested' | 'Interested'

export interface Call {
  id: string
  lead_id: string
  agent_id: string | null
  call_sid: string | null
  conference_sid: string | null
  status: CallStatus
  duration: number | null
  recording_url: string | null
  outcome: CallOutcome | null
  notes: string | null
  started_at: string | null
  ended_at: string | null
  created_at: string
}

export type MessageChannel = 'whatsapp' | 'sms' | 'email'
export type MessageStatus = 'sent' | 'delivered' | 'failed'

export interface Message {
  id: string
  lead_id: string
  sender_id: string | null
  channel: MessageChannel
  body: string | null
  asset_id: string | null
  status: MessageStatus
  sent_at: string | null
  created_at: string
}

export type ActivityType = 'call' | 'message' | 'note' | 'follow-up' | 'status-change' | 'property-share' | 'viewing' | 'deal-update'

export interface Activity {
  id: string
  lead_id: string
  type: ActivityType
  description: string | null
  created_by: string | null
  created_at: string
}

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Half Day'

export interface Attendance {
  id: string
  user_id: string
  org_id: string
  check_in_time: string | null
  check_out_time: string | null
  check_in_lat: number | null
  check_in_lng: number | null
  check_out_lat: number | null
  check_out_lng: number | null
  status: AttendanceStatus | null
  notes: string | null
  selfie_url: string | null
  created_at: string
}

export type SocialPlatform = 'Instagram Reel' | 'Instagram Post' | 'Facebook Post' | 'LinkedIn Post' | 'Story'
export type PostStatus = 'Idea' | 'Draft' | 'Scheduled' | 'Published'

export interface SocialPost {
  id: string
  org_id: string
  created_by: string | null
  assigned_to: string | null
  platform: SocialPlatform
  caption: string | null
  media_urls: string[] | null
  status: PostStatus
  scheduled_at: string | null
  notes: string | null
  zapier_webhook_sent: boolean
  created_at: string
  updated_at: string
}
