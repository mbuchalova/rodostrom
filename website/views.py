from flask import Blueprint, render_template, request, flash, jsonify, url_for
from flask_bcrypt import Bcrypt
from flask_login import login_required, current_user
from .models import *
from sqlalchemy.sql import text

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
        print(f"Form inputs: name={name_query}, surname={surname_query}, gender={gender_query}, birth_date={birth_date_query}, death_date={death_date_query}, birth_city={birth_city_query}, death_city={death_city_query}")

        # Initialize FTS conditions
        fts_conditions = []
        fts_params = {}

        # Full-text search fields
        if name_query:
            fts_conditions.append("fts.name MATCH :name_query")
            fts_params['name_query'] = f"{name_query}*"

        if surname_query:
            fts_conditions.append("fts.surname MATCH :surname_query")
            fts_params['surname_query'] = f"{surname_query}*"

        if birth_city_query:
            fts_conditions.append("fts.birth_city MATCH :birth_city_query")
            fts_params['birth_city_query'] = f"{birth_city_query}*"

        if death_city_query:
            fts_conditions.append("fts.death_city MATCH :death_city_query")
            fts_params['death_city_query'] = f"{death_city_query}*"

        # Combine FTS conditions into a single WHERE clause
        fts_condition_str = " AND ".join(fts_conditions) if fts_conditions else "1=1"

        # Gender condition
        if gender_query.lower() == "unknown":
            gender_condition = "(a.gender IS NULL OR a.gender IN ('male', 'female'))"
        else:
            gender_condition = "a.gender = :gender_query"
            fts_params['gender_query'] = gender_query

        # Handle birth and death dates
        date_conditions = []
        if birth_date_query:
            date_conditions.append("a.birth_date = :birth_date_query")
            fts_params['birth_date_query'] = birth_date_query
        else:
            fts_params['birth_date_query'] = ""  # Placeholder for empty value

        if death_date_query:
            date_conditions.append("a.death_date = :death_date_query")
            fts_params['death_date_query'] = death_date_query
        else:
            fts_params['death_date_query'] = ""  # Placeholder for empty value

        # Combine date conditions
        date_condition_str = " AND ".join(date_conditions) if date_conditions else "1=1"

        # Define the main query with FTS and other conditions
        query = f"""
        SELECT a.id, a.name, a.surname, a.birth_date, a.death_date, a.birth_city, a.death_city, a.gender
        FROM ancestors_fts fts
        JOIN ancestor a
        ON fts.rowid = a.id
        WHERE
            {fts_condition_str}
            AND {gender_condition}
            AND {date_condition_str}
        """

        try:
            # Execute the query
            results = db.session.execute(text(query), fts_params).fetchall()

            # Map column names to row values manually
            columns = ['id', 'name', 'surname', 'birth_date', 'death_date', 'birth_city', 'death_city', 'gender']
            search_results = [dict(zip(columns, row)) for row in results]

        except Exception as e:
            print(f"Error executing search query: {e}")

        # Debug: Print the results
        print("Search results:")
        for result in search_results:
            print(result)

    return render_template('search.html', search_results=search_results, user=current_user)



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
