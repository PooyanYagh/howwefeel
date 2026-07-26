export type Emotion = {
  id: number
  name_fa: string
  category: string
  valence: number
  arousal: number
  icon: string | null
}

export type MoodEntry = {
  id: string
  recorded_at: string
  note: string | null
  mood_score: number
  overall_valence: number
  overall_arousal: number
}

export type Habit = {
  id: string
  title: string
  description: string | null
  icon: string | null
  color: string | null
  target_days: number[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export type HabitStatus = 'done' | 'missed' | 'skipped'

export type HabitLog = {
  id: string
  habit_id: string
  user_id: string
  log_date: string
  status: HabitStatus
  note: string | null
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_at: string | null
  next_action: string | null
}

export type Wish = {
  id: string
  title: string
  description: string | null
  why_it_matters: string | null
  desired_feeling: string | null
  first_step: string | null
  next_step: string | null
  progress: number
  status: string
}

export type PrayerLine = {
  id: number
  text: string
  category: string
  period: string
}
