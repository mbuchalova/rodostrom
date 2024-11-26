from flask import Blueprint, render_template, request
import sqlite3

views = Blueprint('views', __name__)

def get_db_connection():
    conn = sqlite3.connect('ancestors.db')
    conn.row_factory = sqlite3.Row
    return conn

def format_query(query, params):
    """
    Formats an SQL query with parameters for debugging purposes.
    Replaces '?' placeholders with actual parameter values.

    WARNING: Do not use this formatted query directly for execution; it is meant for debugging only.
    """
    for param in params:
        # If param is None, replace it with NULL
        if param is None:
            param = "NULL"
        # If param is a string, surround it with single quotes and escape any single quotes inside the string
        elif isinstance(param, str):
            param = "'" + param.replace("'", "''") + "'"
        # Otherwise, just convert it to a string
        else:
            param = str(param)
        query = query.replace('?', param, 1)
    return query

@views.route('/', methods=['GET', 'POST'])
def home():
    return render_template("my_tree.html")

@views.route('/search/', methods=['GET', 'POST'])
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

        # Debugging: Print the actual SQL query
        formatted_query = format_query(query, params)
        print("Final SQL Query for Debugging:")
        print(formatted_query)

        # Execute query
        search_results = conn.execute(query, params).fetchall()
        conn.close()

        # Debug print results
        print("Search results:")
        for result in search_results:
            print(dict(result))

    return render_template('search.html', search_results=search_results)


@views.route('/communication/', methods=['GET', 'POST'])
def communication():
    return render_template("communication.html")

@views.route('/shared/', methods=['GET', 'POST'])
def shared():
    return render_template("shared_trees.html")