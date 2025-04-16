from app import db, User
user = User.query.filter_by(username='your_test_username').first()
print(user.email)
print(user.password)  # <- this will be a long hashed string
