from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://aidan:your_password@localhost/travelog'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'

db = SQLAlchemy(app)
jwt = JWTManager(app)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

class Trip(db.Model):
    __tablename__ = 'trips'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    city = db.Column(db.String(120), nullable=False)
    country = db.Column(db.String(120), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    accommodation = db.Column(db.String(120), nullable=True)

    favorite_restaurants = db.Column(db.Text, nullable=True)
    favorite_attractions = db.Column(db.Text, nullable=True)
    other_notes = db.Column(db.Text, nullable=True)

    user = db.relationship('User', backref=db.backref('trips', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'city': self.city,
            'country': self.country,
            'start_date': str(self.start_date),
            'end_date': str(self.end_date),
            'accommodation': self.accommodation,
            'favorite_restaurants': self.favorite_restaurants,
            'favorite_attractions': self.favorite_attractions,
            'other_notes': self.other_notes,
        }

@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'username': user.username,
        'email': user.email
    } for user in users])

@app.route('/users/<username>', methods=['GET'])
def get_user_by_username(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email
    })

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already exists"}), 400
    new_user = User(username=data['username'], email=data['email'], password=data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created!"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and user.password == data['password']:
        return jsonify({
            "message": "Login successful!",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/trips', methods=['POST'])
def add_trip():
    try:
        data = request.get_json()
        new_trip = Trip(
            user_id=data['user_id'],
            city=data['city'],
            country=data['country'],
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date(),
            accommodation=data.get('accommodation'),
            favorite_restaurants=data.get('favorite_restaurants'),
            favorite_attractions=data.get('favorite_attractions'),
            other_notes=data.get('other_notes'),
        )
        db.session.add(new_trip)
        db.session.commit()
        return jsonify({"message": "Trip added!", "trip": new_trip.to_dict()}), 201
    except Exception as e:
        print("Error adding trip:", e)
        return jsonify({"error": "Trip creation failed"}), 500

@app.route('/trips/<int:user_id>', methods=['GET'])
def get_user_trips(user_id):
    trips = Trip.query.filter_by(user_id=user_id).all()
    return jsonify([trip.to_dict() for trip in trips])

RESET_DB_ON_START = False

if __name__ == '__main__':
    if RESET_DB_ON_START:
        with app.app_context():
            db.drop_all()
            db.create_all()
            print("Database schema reset.")
    else:
        with app.app_context():
            db.create_all()  # Ensure tables exist if not resetting
    app.run(debug=True)
