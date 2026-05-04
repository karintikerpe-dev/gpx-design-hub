import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://nvenknidnofncqdlrupy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52ZW5rbmlkbm9mbmNxZGxydXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NTQ2NzIsImV4cCI6MjA5MzQzMDY3Mn0.HhVO6Duy6AeCZAX6EtzEAzLDLc7p3SpF2uKuVN5GT40'
)
