from app import app, db
from sqlalchemy import text

with app.app_context():
    db.session.execute(text('DELETE FROM follows'))
    db.session.commit()
    print("Successfully cleared follows table") 