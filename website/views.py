from flask import Blueprint, render_template, request, flash, jsonify, url_for
from flask_bcrypt import Bcrypt
from flask_login import login_required, current_user
from .models import *

views = Blueprint('views', __name__)

@views.route('/', methods=['GET', 'POST'])
@login_required
def home():
    return render_template("my_tree.html", user=current_user)

@views.route('/search/', methods=['GET', 'POST'])
@login_required
def search():
    return render_template("search.html", user=current_user)

@views.route('/communication/', methods=['GET', 'POST'])
@login_required
def communication():
    return render_template("communication.html")

@views.route('/shared/', methods=['GET', 'POST'])
@login_required
def shared():
    return render_template("shared_trees.html", user=current_user)

@views.route('/signin/', methods=['GET', 'POST'])
def signin():
    return render_template("signin.html", user=current_user)

@views.route('/add_user_action', methods=['POST'])
def add_user():
    if request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        surname = data.get('surname')
        email = data.get('email')
        password = Bcrypt().generate_password_hash(data.get('password'))
        new_user = User(name=name, surname=surname, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()
        user_data = {'id': new_user.id, 'name': new_user.name, 'surname': new_user.surname, 'email': new_user.email}
        return jsonify({'success': True, 'user': user_data})

    return jsonify({'success': False})
