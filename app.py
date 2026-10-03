from flask import Flask, request, jsonify
from flask import session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from flask_login import (
    UserMixin,
    LoginManager,
    login_required,
    login_user,
    logout_user,
    current_user,
)
from sqlalchemy.exc import IntegrityError
import validators
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")
DB_HOST = os.getenv("DB_HOST", "localhost")
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"


def origin_request(origin):
    return True


CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})


class user(db.Model, UserMixin):
    __tablename__ = "user"
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    username = db.Column(db.String(30), nullable=False, unique=True)
    gender = db.Column(db.String(90), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String(90), nullable=False, unique=True)
    password = db.Column(db.Text, nullable=False)
    content = db.relationship("feed", cascade="all, delete", backref="user", lazy=True)
    friends = db.relationship(
        "follow", cascade="all, delete", backref="user", lazy=True
    )
    comment = db.relationship(
        "comments", cascade="all, delete", backref="user", lazy=True
    )
    bio = db.Column(db.String(90))


class feed(db.Model):
    __tablename__ = "feed"
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    post_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_name = db.Column(db.String(30), nullable=False)
    text = db.Column(db.String(3000))
    likes = db.Column(db.Integer)
    comment = db.relationship(
        "comments", cascade="all, delete", backref="feed", lazy=True
    )


class follow(db.Model):
    __tablename__ = "follow"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    follower_id = db.Column(db.Integer, nullable=False, autoincrement=False)
    followed_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)


class comments(db.Model):
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    userID = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    postID = db.Column(db.Integer, db.ForeignKey("feed.post_id"), nullable=False)
    comment = db.Column(db.String(200), nullable=False)


@app.route("/Cadastro/Criar_perfil", methods=["POST"])
def cadastro():
    data = request.json
    nome = data.get("UserName", "").strip()
    senha = data.get("Password", "").strip()
    chave_acesso = data.get("accees_key")
    email = data.get("email", "").strip()
    genero = data.get("Gender")
    nascimento = int(data.get("Age"))
    ano_atual = datetime.now().year
    idade = ano_atual - nascimento
    print(data)
    if not nome or not senha or not email or not genero or not nascimento:
        return jsonify({"mensagem_requisito1": "Preencha todos os campos"})
    elif not any(char.isdigit() for char in senha):
        return jsonify({"mensagem_requisito2": "A senha deve conter números e letras"})
    elif not any(char.isalpha() for char in senha):
        return jsonify({"mensagem_requisito2": "A senha deve conter números e letras"})
    elif not any(char.islower() for char in senha):
        return jsonify(
            {"mensagem_requisito3": "A senha deve conter maiúsculas e minúsculas"}
        )
    elif not any(char.isupper() for char in senha):
        return jsonify(
            {"mensagem_requisito3": "A senha deve conter maiúsculas e minúsculas"}
        )

    elif idade <= 11:
        return jsonify(
            {"mensagem_4": "É necessario ter no minimo 12 anos para se cadastrar"}
        )
    else:
        usuario = user(
            username=nome,
            password=generate_password_hash(senha),
            email=email,
            gender=genero,
            age=idade,
        )
    db.session.add(usuario)
    db.session.commit()
    return jsonify({"mensagem_cadastro": "Perfil Cadastrado!"}), 200


@app.route("/Login/entrar", methods=["POST"])
def login():
    data = request.json
    print(data)
    usuario = user.query.filter_by(username=data.get("Name")).first()
    if usuario and check_password_hash(usuario.password, data.get("Password")):
        login_user(usuario)
        print(current_user.is_authenticated)
        print(current_user.id)
        return jsonify({"mensagem_login": "Bem vindo de volta!"})

    else:
        return jsonify({"mensagem_user-not_found": "Nome ou senha incorretos"})


@login_manager.user_loader
def loader(user_id):
    return user.query.get(int(user_id))


@app.route("/Logout/sair", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"mensagem_logout": "Até a proxima!"})


@app.route("/api/perfil/edit", methods=["PUT"])
@login_required
def profile_update():
    data = request.json
    print(data)
    new_bio = data.get("bio_user")
    new_username = data.get("new_name")
    usuario = user.query.get(current_user.id)
    usuario.bio = new_bio
    usuario.username = new_username
    db.session.add(usuario)
    db.session.commit()
    return jsonify({"bio_changed": "profile updated successfully"})


@app.route("/api/perfil/informacoes", methods=["GET"])
@login_required
def getProfile_data():
    usuario = {
        "id": current_user.id,
        "Name": current_user.username,
        "bio": current_user.bio,
    }
    profile_posts = []
    user_posts = feed.query.all()
    for i in user_posts:
        posts_list = (
            {
                "user_id": i.user_id,
                "post_id": i.post_id,
                "user_name": i.user_name,
                "text": i.text,
                "likes": i.likes,
                "comment": i.comment,
            },
        )
        if i.user_id == current_user.id:
            profile_posts.append(posts_list)
    return jsonify(usuario, profile_posts)


@app.route("/api/Text_post/postagens", methods=["POST"])
@login_required
def post():
    data_post = request.json
    text_post = data_post.get("Text")
    new_post = feed(
        user_id=current_user.id, user_name=current_user.username, text=text_post
    )
    print(new_post)
    db.session.add(new_post)
    db.session.commit()
    return jsonify({"mensagem_post": "Postagem feita com sucesso!"})


@app.route("/api/Text_post/feed", methods=["GET"])
@login_required
def all_posts():
    posts = feed.query.all()
    friends = follow.query.all()
    friend_list = []
    post_list = []
    for i in friends:
        if i.follower_id == current_user.id:
            friend_list.append(i.followed_id)
    for p in posts:
        feed_list = {
            "user_id": p.user_id,
            "post_id": p.post_id,
            "user_name": p.user_name,
            "text": p.text,
            "likes": p.likes,
        }
        if p.user_id in friend_list:
            post_list.append(feed_list)
    return jsonify(post_list)


@app.route("/api/Text_post/delete-post/<int:post_id>", methods=["DELETE"])
@login_required
def delete_post(post_id):
    posts = feed.query.get(post_id)
    if posts:
        db.session.delete(posts)
        db.session.commit()
        return jsonify({"mensagem_delete-post": "Post deletado com sucesso!"})
    else:
        return jsonify({"mensagem_post-not-found": "Post não encontrado"})


@app.route("/api/Text_post/like-post/<int:post_id>", methods=["PUT"])
@login_required
def like_Post(post_id):
    posts = feed.query.filter_by(post_id=post_id).first()
    if posts:
        posts.likes = +1
        db.session.commit()
        return jsonify({"mensagem_like": "Curtido"})
    else:
        return jsonify({"mensagem_post-not-found2": "Post não encontrado"})


@app.route("/api/Search/<int:getprofileById>", methods=["GET"])
@login_required
def search_friends(getprofileById):
    users = user.query.filter_by(id=getprofileById).first()
    posts = feed.query.all()
    followers = follow.query.all()
    quantity_follower = 0
    post_list = []
    if users:
        for u in followers:
            follow_list = {"follower_id": u.follower_id, "followed_id": u.followed_id}
            if u.followed_id == getprofileById:
                quantity_follower += 1
                all_followers = {"Seguidores": quantity_follower}
        for i in posts:
            posts_user = {
                "user_id": i.user_id,
                "post_id": i.post_id,
                "user_name": i.user_name,
                "text": i.text,
                "likes": i.likes,
            }
            if i.user_id == getprofileById:
                post_list.append(posts_user)

    return jsonify(all_followers, post_list)


@app.route("/api/Follow/<int:add_friends>", methods=["POST"])
@login_required
def friends(add_friends):
    users = user.query.filter_by(id=add_friends).first()
    existing_friend = follow.query.filter_by(
        follower_id=current_user.id, followed_id=add_friends
    ).first()
    if not users:
        return jsonify({"mesagem_friend-notfound": "Usuario não encontrado"}), 404

    if existing_friend:
        return jsonify({"mensage_error1": "Vocês já são amigos!"}), 409
    try:
        followers = follow(follower_id=current_user.id, followed_id=add_friends)
        db.session.add(followers)
        db.session.commit()
        return jsonify({"mesagem_friends": "Agora vocês são amigos!"}), 200
    except IntegrityError:
        db.session.rollback()  # Desfaz a tentativa de inserção
        return jsonify({"mensage_error2": "Não foi possivel seguir este usuario"}), 400


@app.route("/api/Unfollow/<int:remove_friend_By_id>", methods=["DELETE"])
@login_required
def unfollow(remove_friend_By_id):
    users = follow.query.filter_by(followed_id=remove_friend_By_id).first()
    if users:
        db.session.delete(users)
        db.session.commit()
        return jsonify({"mensage_remove-friends": "Vocês deixou de seguir"})
    else:
        return jsonify({"mensage_remove-friends-not_found": "Usuario não encontrado"})


@app.route("/api/Comment/<int:Id_post>", methods=["POST"])
@login_required
def comment_post(Id_post):
    posts = feed.query.filter_by(post_id=Id_post).first()
    comment_profile = request.json
    comment_post = comment_profile.get("Comentario")
    if posts:
        new_comment = comments(
            userID=current_user.id, postID=Id_post, comment=comment_post
        )
        db.session.add(new_comment)
        db.session.commit()
    return jsonify({"mensagem_comment": "Comentario postado"})


@app.route("/api/Comment/<int:postID>", methods=["GET"])
@login_required
def view_comments(postID):
    comment = comments.query.all()
    comment_list = []
    for c in comment:
        all_comments = {
            "id": c.id,
            "userID": c.userID,
            "postID": c.postID,
            "likes_comment": c.likes_comment,
            "comment": c.comment,
        }
        if c.postID == postID:
            comment_list.append(all_comments)
    return jsonify(comment_list)


@app.route("/api/Delete Profile/ deleteMyprofile", methods=["DELETE"])
@login_required
def delete_myprofile():

    user_byid = user.query.filter_by(id=current_user.id).first()
    if user_byid:
        db.session.delete(current_user)
        db.session.commit()
        return jsonify(
            {
                "mensagem_delete_profile": "Perifl deletedo com sucesso. Vamos sentir sua falta! :("
            }
        )


# Servidor criado apenas para desenvolvimento
@app.route("/")
def hello_world():
    return "Hello World"


if __name__ == "__main__":
    app.run(debug=True)
