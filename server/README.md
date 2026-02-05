## Backend Setup (Flask + MongoDB Atlas)

### 1) Create venv
python -m venv venv

### 2) Activate
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

### 3) Install dependencies/packages
pip install -r requirements.txt

### 4) Setup env
create .env file and store necessary variables there

### 5) Run
python run.py

### 6) Test
Open:
http://localhost:3000/api/health
