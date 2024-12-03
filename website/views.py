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
    search_results = []
    if request.method == 'POST':
        # Retrieve form inputs
        name_query = request.form.get('name', '').strip()
        surname_query = request.form.get('surname', '').strip()
        gender_query = request.form.get('gender', '').strip()
        birth_date_query = request.form.get('birth_date', '').strip()
        death_date_query = request.form.get('death_date', '').strip()
        birth_city_query = request.form.get('birth_city', '').strip()
        death_city_query = request.form.get('death_city', '').strip()

        # Debug inputs
        print(f"Form inputs: name={name_query}, surname={surname_query}, birth_city={birth_city_query}")

        # Connect to the database
        conn = get_db_connection()

        # Full-text search conditions
        fts_conditions = []
        fts_params = []

        if name_query:
            fts_conditions.append("fts.name MATCH ?")
            fts_params.append(f'{name_query}*')

        if surname_query:
            fts_conditions.append("fts.surname MATCH ?")
            fts_params.append(f'{surname_query}*')

        if birth_city_query:
            fts_conditions.append("fts.birth_city MATCH ?")
            fts_params.append(f'{birth_city_query}*')

        if death_city_query:
            fts_conditions.append("fts.death_city MATCH ?")
            fts_params.append(f'{death_city_query}*')

        # Combine FTS conditions
        fts_condition_str = " AND ".join(fts_conditions) if fts_conditions else "1=1"

        # Modify gender handling
        if gender_query.lower() == "unknown":
            gender_condition = "? IS NULL OR gender = 'Muž' OR gender = 'Žena'"
            gender_params = (None,)
        else:
            gender_condition = "gender = ?"
            gender_params = (gender_query,)

        # Main query
        query = f'''
        SELECT a.id, a.name, a.surname, a.birth_date, a.death_date, a.birth_city, a.death_city, a.gender
        FROM ancestors_fts fts
        JOIN ancestors a
        ON fts.rowid = a.id
        WHERE
            {fts_condition_str}
            AND ({gender_condition})
            AND (? = '' OR a.birth_date = ?)
            AND (? = '' OR a.death_date = ?)
        '''
        params = (
            *fts_params,  # Parameters for FTS conditions
            *gender_params,     # Parameters for gender conditions
            birth_date_query, birth_date_query,
            death_date_query, death_date_query,
        )

        # Execute query
        search_results = conn.execute(query, params).fetchall()
        conn.close()

        # Debug print results
        print("Search results:")
        for result in search_results:
            print(dict(result))

    return render_template('search.html', search_results=search_results)


@views.route('/communication/', methods=['GET', 'POST'])
@login_required
def communication():
    return render_template("communication.html", user=current_user)

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
