#!/bin/bash

echo "Setting up backend..."
cd travelog-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
echo "Backend setup complete!"

echo "Setting up frontend..."
cd ../travelog-frontend
npm install
npm install react-icons lucide-react
echo "Frontend setup complete!"

echo ""
echo "To run your project:"
echo "  ▶ Backend: Go to travelog-backend directory --> .env.example file and follow the instructions.
           ▶ Then run: source travelog-backend/venv/bin/activate && python3 travelog-backend/app.py"
echo "  ▶ Frontend: Open a new terminal and run cd travelog-frontend && npm run dev"
