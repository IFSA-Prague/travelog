# travelog

### Team
Natalie Ramirez, Ansh Suryawanshi, Isabella De Sousa, Luca Rizzo, Aidan Benedict

### About
A social media platform for travelers to log, review, and share their travel itineraries, destinations, and experiences. Combines the personalization of a travel journal with the engagement of social media.

### Goal
The goal of this project is to create a social media platform for travelers to log, review, and share their itineraries, destinations, and experiences. Combining the personalization of a travel journal with the engagement of social media, the platform allows users to document trips, share recommendations, and interact with a community of like-minded travelers. It aims to inspire discovery, streamline trip planning, and foster connections through shared experiences.

### Running the Program
  - cd to travelog-frontend and type npm run dev in terminal.
      - Might have to install packages.


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
