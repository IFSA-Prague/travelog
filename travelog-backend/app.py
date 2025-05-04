from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import uuid

# ----------------------- Setup -----------------------
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://ansh@localhost/travelog'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

db = SQLAlchemy(app)
jwt = JWTManager(app)

# ----------------------- Models -----------------------
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    following = db.relationship(
        'User',
        secondary='follows',
        primaryjoin='User.id==Follow.follower_id',
        secondaryjoin='User.id==Follow.followed_id',
        backref=db.backref('followers', lazy='dynamic'),
        lazy='dynamic'
    )

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'avatar_url': f'/uploads/user_{self.id}.png'
        }

class Follow(db.Model):
    __tablename__ = 'follows'
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    followed_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
class Like(db.Model):
    __tablename__ = 'likes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=False)

class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('comments', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else None,
            'content': self.content,
            'created_at': str(self.created_at)
        }

class City(db.Model):
    __tablename__ = 'cities'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    country = db.Column(db.String(120), nullable=False)
    trips = db.relationship('Trip', backref='city_ref', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'country': self.country,
            'trip_count': len(self.trips)
        }

class Trip(db.Model):
    __tablename__ = 'trips'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    city_id = db.Column(db.Integer, db.ForeignKey('cities.id'), nullable=True)
    city = db.Column(db.String(120), nullable=False)
    country = db.Column(db.String(120), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    accommodation = db.Column(db.String(120), nullable=True)
    favorite_restaurants = db.Column(db.Text, nullable=True)
    favorite_attractions = db.Column(db.Text, nullable=True)
    other_notes = db.Column(db.Text, nullable=True)
    photos = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('trips', lazy=True))

    def to_dict(self):
        photos = self.photos or []
        for photo in photos:
            if 'url' in photo:
                photo['url'] = f"http://localhost:5050{photo['url']}"

        likes = Like.query.filter_by(trip_id=self.id).all()
        comments = Comment.query.filter_by(trip_id=self.id).order_by(Comment.created_at.asc()).all()

        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else None,
            'city': self.city,
            'country': self.country,
            'city_id': self.city_id,
            'start_date': str(self.start_date),
            'end_date': str(self.end_date),
            'accommodation': self.accommodation,
            'favorite_restaurants': self.favorite_restaurants,
            'favorite_attractions': self.favorite_attractions,
            'other_notes': self.other_notes,
            'photos': photos,
            'likes': len(likes),
            'comments': [comment.to_dict() for comment in comments],
            'created_at': str(self.created_at)
        }

# ----------------------- User Routes -----------------------

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "User already exists"}), 409

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=new_user.id)
    return jsonify({"message": "User created", "access_token": access_token}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{ 'id': user.id, 'username': user.username, 'email': user.email } for user in users])

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify({ 'id': user.id, 'username': user.username, 'email': user.email })
    return jsonify({'error': 'User not found'}), 404

@app.route('/users/<int:user_id>/followers', methods=['GET'])
def get_followers(user_id):
    user = User.query.get(user_id)
    if user:
        followers = [{"id": f.id, "username": f.username} for f in user.followers]
        return jsonify(followers)
    return jsonify([])

@app.route('/users/<int:user_id>/following', methods=['GET'])
def get_following(user_id):
    user = User.query.get(user_id)
    if user:
        following = [{"id": u.id, "username": u.username} for u in user.following]
        return jsonify(following)
    return jsonify([])

@app.route('/users/<int:user_id>/follow', methods=['POST'])
def follow_user(user_id):
    target_id = request.json.get("target_user_id")
    if not target_id:
        return jsonify({"error": "Missing target user id"}), 400
    existing = Follow.query.filter_by(follower_id=user_id, followed_id=target_id).first()
    if not existing:
        new_follow = Follow(follower_id=user_id, followed_id=target_id)
        db.session.add(new_follow)
        db.session.commit()
    return jsonify({"message": "Followed"})

@app.route('/users/<int:user_id>/unfollow', methods=['POST'])
def unfollow_user(user_id):
    target_id = request.json.get("target_user_id")
    follow = Follow.query.filter_by(follower_id=user_id, followed_id=target_id).first()
    if follow:
        db.session.delete(follow)
        db.session.commit()
    return jsonify({"message": "Unfollowed"})

@app.route('/users/<int:user_id>/upload_photo', methods=['POST'])
def upload_profile_photo(user_id):
    file = request.files.get('photo')
    if not file:
        return jsonify({"error": "No file uploaded"}), 400
    filename = f"user_{user_id}.png"
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(path)
    return jsonify({"message": "Photo uploaded", "photo_url": f"/uploads/{filename}"}), 200

@app.route('/users/<int:user_id>/has_photo', methods=['GET'])
def user_has_photo(user_id):
    filename = f"user_{user_id}.png"
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    return jsonify({"hasPhoto": os.path.exists(path)})

# ----------------------- Trip Routes -----------------------
@app.route('/trips', methods=['POST'])
def add_trip():
    try:
        form = request.form
        files = request.files.getlist('media')

        # Handle city
        city_name = form['city'].strip()
        country = form['country'].strip()
        
        # Check if city exists
        city = City.query.filter_by(name=city_name, country=country).first()
        if not city:
            # Create new city if it doesn't exist
            city = City(name=city_name, country=country)
            db.session.add(city)
            db.session.flush()  # Get the city ID without committing

        photo_metadata = []
        for file in files:
            if file.filename:
                filename = f"{uuid.uuid4()}_{file.filename}"
                path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(path)
                photo_metadata.append({
                    "filename": filename,
                    "url": f"/uploads/{filename}",
                    "mimetype": file.mimetype
                })

        new_trip = Trip(
            user_id=form['user_id'],
            city_id=city.id,  # Add city_id
            city=city_name,  # Keep for backward compatibility
            country=country,  # Keep for backward compatibility
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
        print("Error adding trip:", e)
        return jsonify({"error": "Trip creation failed"}), 500

@app.route('/trips/<int:user_id>', methods=['GET'])
def get_user_trips(user_id):
    trips = Trip.query.filter_by(user_id=user_id).all()
    return jsonify([trip.to_dict() for trip in trips])

@app.route('/trips/<int:trip_id>', methods=['DELETE'])
def delete_trip(trip_id):
    try:
        trip = Trip.query.get_or_404(trip_id)
        if trip.photos:
            for photo in trip.photos:
                if 'filename' in photo:
                    path = os.path.join(app.config['UPLOAD_FOLDER'], photo['filename'])
                    if os.path.exists(path):
                        os.remove(path)
        db.session.delete(trip)
        db.session.commit()
        return jsonify({"message": "Trip deleted successfully"}), 200
    except Exception as e:
        print("Error deleting trip:", e)
        return jsonify({"error": "Failed to delete trip"}), 500

# ----------------------- Feed Routes -----------------------
@app.route('/feed/<int:user_id>', methods=['GET'])
def get_following_feed(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Get trips from users they follow (excluding their own trips)
    following_ids = [u.id for u in user.following]
    trips = Trip.query.filter(Trip.user_id.in_(following_ids)).order_by(Trip.created_at.desc()).all()

    return jsonify([trip.to_dict() for trip in trips])

@app.route('/trips/<int:trip_id>/like', methods=['POST'])
def like_trip(trip_id):
    user_id = request.json.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400
    existing = Like.query.filter_by(user_id=user_id, trip_id=trip_id).first()
    if not existing:
        like = Like(user_id=user_id, trip_id=trip_id)
        db.session.add(like)
        db.session.commit()
    return jsonify({'message': 'Liked'})

@app.route('/trips/<int:trip_id>/unlike', methods=['POST'])
def unlike_trip(trip_id):
    user_id = request.json.get('user_id')
    like = Like.query.filter_by(user_id=user_id, trip_id=trip_id).first()
    if like:
        db.session.delete(like)
        db.session.commit()
    return jsonify({'message': 'Unliked'})

@app.route('/trips/<int:trip_id>/comment', methods=['POST'])
def comment_trip(trip_id):
    data = request.get_json()
    user_id = data.get("user_id")
    content = data.get("content")

    if not user_id or not content:
        return jsonify({"error": "Missing user_id or content"}), 400

    new_comment = Comment(trip_id=trip_id, user_id=user_id, content=content)
    db.session.add(new_comment)
    db.session.commit()

    user = User.query.get(user_id)

    return jsonify({
        "id": new_comment.id,
        "user_id": new_comment.user_id,
        "username": user.username if user else "Unknown",
        "content": new_comment.content,
        "created_at": new_comment.created_at.isoformat()
    }), 201

@app.route('/trips/<int:trip_id>/comments', methods=['GET'])
def get_trip_comments(trip_id):
    trip = Trip.query.get(trip_id)
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404

    comments = Comment.query.filter_by(trip_id=trip_id).order_by(Comment.created_at.asc()).all()
    comment_data = []
    for comment in comments:
        user = User.query.get(comment.user_id)
        comment_data.append({
            'id': comment.id,
            'user_id': comment.user_id,
            'username': user.username if user else "Unknown",
            'content': comment.content,
            'created_at': comment.created_at.isoformat()
        })
    return jsonify(comment_data), 200

@app.route('/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404

    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Comment deleted'}), 200

@app.route('/trip/<int:trip_id>', methods=['GET'])
def get_trip(trip_id):
    trip = Trip.query.get(trip_id)
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404
    return jsonify(trip.to_dict()), 200

# ----------------------- Upload Access -----------------------
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ----------------------- Misc -----------------------
@app.route('/ping')
def ping():
    return jsonify({"message": "pong!"})

@app.route('/cities', methods=['GET'])
def get_cities():
    try:
        cities = City.query.all()
        return jsonify([city.to_dict() for city in cities]), 200
    except Exception as e:
        print("Error fetching cities:", e)
        return jsonify({"error": "Failed to fetch cities"}), 500

@app.route('/cities/search', methods=['GET'])
def search_cities():
    try:
        query = request.args.get('q', '').lower()
        if not query:
            return jsonify([]), 200

        cities = City.query.filter(
            db.or_(
                db.func.lower(City.name).contains(query),
                db.func.lower(City.country).contains(query)
            )
        ).all()
        
        return jsonify([city.to_dict() for city in cities]), 200
    except Exception as e:
        print("Error searching cities:", e)
        return jsonify({"error": "Failed to search cities"}), 500

@app.route('/cities/<int:city_id>', methods=['GET'])
def get_city(city_id):
    try:
        city = City.query.get(city_id)
        if not city:
            return jsonify({"error": "City not found"}), 404
        return jsonify(city.to_dict()), 200
    except Exception as e:
        print("Error fetching city:", e)
        return jsonify({"error": "Failed to fetch city"}), 500

@app.route('/cities/<int:city_id>/trips', methods=['GET'])
def get_city_trips(city_id):
    try:
        trips = Trip.query.filter_by(city_id=city_id).order_by(Trip.start_date.desc()).all()
        return jsonify([trip.to_dict() for trip in trips]), 200
    except Exception as e:
        print("Error fetching city trips:", e)
        return jsonify({"error": "Failed to fetch city trips"}), 500

@app.route('/cities/<int:city_id>/users', methods=['GET'])
def get_city_users(city_id):
    try:
        city = City.query.get(city_id)
        if not city:
            return jsonify({"error": "City not found"}), 404
            
        # Get unique users who have trips in this city
        users = User.query.join(Trip).filter(Trip.city_id == city_id).distinct().all()
        return jsonify([user.to_dict() for user in users]), 200
    except Exception as e:
        print("Error fetching city users:", e)
        return jsonify({"error": "Failed to fetch city users"}), 500

# ----------------------- DB Init -----------------------
RESET_DB_ON_START = False
if __name__ == '__main__':
    with app.app_context():
        if RESET_DB_ON_START:
            db.drop_all()
            db.create_all()
            print("Database schema reset.")
        else:
            db.create_all()
    app.run(debug=True, host="0.0.0.0", port=5050)
