from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://natalieramirez:your_password@localhost/travelog'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

db = SQLAlchemy(app)
jwt = JWTManager(app)

# ----------------------- Models -----------------------
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)

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
    photos = db.Column(db.JSON, nullable=True)
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
            'photos': self.photos or []
        }

# ----------------------- Routes -----------------------
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'username': user.username,
        'email': user.email
    } for user in users])

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')

        if not email or not username or not password:
            return jsonify({"message": "Missing fields"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"message": "Email already exists"}), 400
        if User.query.filter_by(username=username).first():
            return jsonify({"message": "Username already exists"}), 400

        hashed_password = generate_password_hash(password)
        new_user = User(username=username, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User created!"}), 201
    except Exception as e:
        print("Signup error:", e)
        return jsonify({"message": "Error creating user"}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"message": "Missing username or password"}), 400

        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({"message": "User not found"}), 404

        if not check_password_hash(user.password, password):
            return jsonify({"message": "Incorrect password"}), 401

        access_token = create_access_token(identity=user.id)

        return jsonify({
            "message": "Login successful!",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            },
            "token": access_token
        }), 200
    except Exception as e:
        print("Login error:", e)
        return jsonify({"message": "Login failed"}), 500

@app.route('/trips', methods=['POST'])
def add_trip():
    try:
        form = request.form
        files = request.files.getlist('media')

        # Store file metadata (or implement file saving logic later)
        photo_metadata = []
        for file in files:
            photo_metadata.append({
                "filename": file.filename,
                "mimetype": file.mimetype
            })

        new_trip = Trip(
            user_id=form['user_id'],
            city=form['city'],
            country=form['country'],
            start_date=datetime.strptime(form['startDate'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(form['endDate'], '%Y-%m-%d').date(),
            accommodation=form.get('accommodation'),
            favorite_restaurants=form.get('favoriteRestaurants'),
            favorite_attractions=form.get('favoriteAttractions'),
            other_notes=form.get('otherNotes'),
            photos=photo_metadata
        )
        db.session.add(new_trip)
        db.session.commit()
        return jsonify({"message": "Trip added!", "trip": new_trip.to_dict()}), 201
    except Exception as e:
        print("❌ Error adding trip:", e)
        return jsonify({"error": "Trip creation failed"}), 500

@app.route('/trips/<int:user_id>', methods=['GET'])
def get_user_trips(user_id):
    trips = Trip.query.filter_by(user_id=user_id).all()
    return jsonify([trip.to_dict() for trip in trips])

@app.route('/ping')
def ping():
    return jsonify({"message": "pong!"})

# ----------------------- DB Init -----------------------
RESET_DB_ON_START = False

if __name__ == '__main__':
    with app.app_context():
        if RESET_DB_ON_START:
            db.drop_all()
            db.create_all()
            print("🗑️ Database schema reset.")
        else:
            db.create_all()
    app.run(debug=True, host="0.0.0.0", port=5050)
