from flask import Blueprint, render_template

views = Blueprint('views', __name__)


@views.route('/', methods=['GET', 'POST'])
def home():
    return render_template("my_tree.html")

@views.route('/search/', methods=['GET', 'POST'])
def search():
    return render_template("search.html")

@views.route('/communication/', methods=['GET', 'POST'])
def communication():
    return render_template("communication.html")

@views.route('/shared/', methods=['GET', 'POST'])
def shared():
    return render_template("shared_trees.html")