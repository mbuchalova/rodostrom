from . import db
from flask_login import UserMixin

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150))
    surname = db.Column(db.String(150))
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))

class Ancestor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150))
    surname = db.Column(db.String(150))
    gender = db.Column(db.String(150))
    birth_date = db.Column(db.String(150))
    death_date = db.Column(db.String(150))
    birth_city = db.Column(db.String(150))
    death_city = db.Column(db.String(150))
