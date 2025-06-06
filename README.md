# travelog
## How to Run travelog
- Clone the repo
- Run setup script: `./setup.sh`
- Follow setup script instructions:
    - Backend: adjust .env.example file as instructed and run `python3 app.py` in travelog-backend directory
    - Frontend: run `npm run dev` in travelog-frontend directory

### Team
Natalie Ramirez, Ansh Suryawanshi, Isabella De Sousa, Luca Rizzo, Aidan Benedict

### About
A social media platform for travelers to log, review, and share their travel itineraries, destinations, and experiences. Combines the personalization of a travel journal with the engagement of social media.

### Goal
The goal of this project is to create a social media platform for travelers to log, review, and share their itineraries, destinations, and experiences. Combining the personalization of a travel journal with the engagement of social media, the platform allows users to document trips, share recommendations, and interact with a community of like-minded travelers. It aims to inspire discovery, streamline trip planning, and foster connections through shared experiences.

### Running the Program
  - To start the frontend:
      - cd travelog-frontend
      - npm install
      - npm run dev
  - To start the backend:
      - cd travelog-backend
      - python3 -m venv venv
      - source venv/bin/activate (mac) or source venv/bin/activate (windows)
      - pip install flask_cors
      - pip install flask_sqlalchemy
      - pip install psycopg2
      - pip install flask_jwt_extended
      - python3 app.py
      - In travelog-backend directory, app.py file: Change line 11 to include your name:
        - `# Set up the database URI for SQLAlchemy app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://[YOUR NAME]:1212@localhost/travelog'`



### Data Flow Diagram
<img width="791" alt="data_diagram" src="https://github.com/user-attachments/assets/304b79df-4e8b-41c4-9fa5-0ec0c6802b5e" />


### Architecture
#### Design
1. Figma
  - We use Figma to design this web app because it allows for real-time collaboration among team members, and has an intuitive interface that allows us to create the UI we want. Some of the team members also had prior experience with Figma.

#### Frontend
1. React.js
  - Component-based UI for dynamic features like interactive maps, itineraries, and user feeds.
  - React Router for handling navigation between pages (Home, Search, Map, My Log, Profile).
  - State management tools like Redux for managing complex application states, such as user data and trip logs.
  - Some of the team members had prior experience with React and there are many resources for the framework to learn and develop with.

2. Map Integration
  - Integrate Google Maps API to display interactive maps.

#### Backend
1. Flask
  - Easy implementation for RESTful API 
  - Flask works well with PostgreSQL (structured data like user profiles)

2. Client-Server
  - The client (frontend) and server (backend) handle different responsibilities, improving maintainability.
  - Flask allows easy creation of RESTful APIs for communication between the client and server.
  - Supports database integration (postgreSQL), caching, and middleware for advanced features.
  - Built-in debugger and testing tools simplify development and troubleshooting.


#### Research Papers
* Success Factors in Social Media Platforms: [2554850.2554902.pdf](https://github.com/user-attachments/files/19633390/2554850.2554902.pdf)
* Understanding Consumer Engagement in Social Media: [1-s2.0-S0167923621002177-main.pdf](https://github.com/user-attachments/files/19633565/1-s2.0-S0167923621002177-main.pdf)
* Empowering Engagement with Social Media: https://doi.org/10.1080/1553118X.2017.1284072


