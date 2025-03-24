import os
import subprocess

def run_in_vscode_terminal(command):
    """
    Opens a new terminal tab in VS Code and executes the given command.
    """
    vscode_command = f"cmd.exe /c start cmd /k \"{command}\""
    subprocess.Popen(vscode_command, shell=True)

# Get the base project directory
base_dir = os.path.abspath(os.path.dirname(__file__))

# Open Backend in a new terminal tab
run_in_vscode_terminal(f"cd /d {base_dir}\\backend && venv\\Scripts\\activate && cd Gym_Management_System && python manage.py runserver")

# Open Frontend (React) in another terminal tab
run_in_vscode_terminal(f"cd /d {base_dir}\\frontend && npm run dev")

# Open Ngrok in another terminal tab
run_in_vscode_terminal("ngrok http 8000")

# Open Expo in another terminal tab
run_in_vscode_terminal(f"cd /d {base_dir}\\application && npx expo start")
