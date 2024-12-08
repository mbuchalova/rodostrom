from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from sqlalchemy import text
import logging

db = SQLAlchemy()
DB_NAME = "database.db"

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = "dh8aiho68chudi568"
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///database.db"
    db.init_app(app)

    from .models import User, Ancestor

    from .views import views
    from .authorization import auth

    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')

    with app.app_context():
        db.create_all()
        create_fts_table()

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    print(app.config['SQLALCHEMY_DATABASE_URI'])

    @login_manager.user_loader
    def load_user(id):
        return User.query.get(int(id))

    # Enable SQLAlchemy query logging
    logging.basicConfig()
    logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

    return app

def create_fts_table():
    """Create the FTS virtual table and add triggers."""
    with db.engine.connect() as connection:
        # Create the FTS table
        connection.execute(text("""
        CREATE VIRTUAL TABLE IF NOT EXISTS ancestors_fts USING fts5(
            name,
            surname,
            birth_city,
            death_city
        )
        """))

        # Trigger for insert
        connection.execute(text("""
        CREATE TRIGGER IF NOT EXISTS ancestor_ai AFTER INSERT ON ancestor
        BEGIN
            INSERT INTO ancestors_fts (rowid, name, surname, birth_city, death_city)
            VALUES (new.id, new.name, new.surname, new.birth_city, new.death_city);
        END;
        """))

        # Trigger for update
        connection.execute(text("""
        CREATE TRIGGER IF NOT EXISTS ancestor_au AFTER UPDATE ON ancestor
        BEGIN
            UPDATE ancestors_fts
            SET name = new.name,
                surname = new.surname,
                birth_city = new.birth_city,
                death_city = new.death_city
            WHERE rowid = new.id;
        END;
        """))

        # Trigger for delete
        connection.execute(text("""
        CREATE TRIGGER IF NOT EXISTS ancestor_ad AFTER DELETE ON ancestor
        BEGIN
            DELETE FROM ancestors_fts WHERE rowid = old.id;
        END;
        """))