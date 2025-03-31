from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for the React app running on localhost:5173
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Set up the database URI for SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://aidan:your_password@localhost/travelog'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database and JWT manager
db = SQLAlchemy(app)
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # Change this to a secure secret key
jwt = JWTManager(app)

# Define your User model
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)  # In production, hash passwords

    def __repr__(self):
        return f"<User {self.username}>"

# Create the tables in the database
with app.app_context():
    db.create_all()

# Route to get all users
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()  # Get all users from the database
    users_list = [{"username": user.username, "email": user.email} for user in users]
    return jsonify(users_list)

# Route for SignUp
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()  # Get data sent in the POST request
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already exists"}), 400
    new_user = User(username=data['username'], email=data['email'], password=data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created!"}), 201

# Route for Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()  # Get data sent in the POST request
    user = User.query.filter_by(username=data['username']).first()

    if user and user.password == data['password']:  # In production, hash passwords and compare hashes
        return jsonify({"message": "Login successful!"}), 200
    return jsonify({"message": "Invalid credentials"}), 401

if __name__ == '__main__':
    app.run(debug=True)