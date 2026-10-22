import os
import shutil

env_path = 'C:/Users/praty/Desktop/emo-girl/emosense-source/.env'
backup_path = 'C:/Users/praty/Desktop/emo-girl/emosense-source/.env.backup'

if not os.path.exists(backup_path):
    shutil.copy2(env_path, backup_path)
    print(f'Backed up {env_path} to {backup_path}')

new_env = (
    'VITE_SUPABASE_PROJECT_ID="wzuivhmhlozdaslpwlzt"\n'
    'VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6dWl2aG1obG96ZGFzbHB3bHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODQzMjUsImV4cCI6MjA5MzA2MDMyNX0.N5aHVVjnymkk4AlyANSPpPd0i56qFKFtxmy7ZTfU7sc"\n'
    'VITE_SUPABASE_URL="https://wzuivhmhlozdaslpwlzt.supabase.co"\n'
)

with open(env_path, 'w', encoding='utf-8') as f:
    f.write(new_env)

print(f'Updated {env_path} with production Supabase configuration successfully.')
