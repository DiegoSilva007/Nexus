let bio = document.getElementById("newBio");
let name_user = document.getElementById("newName");
let post_text = document.getElementById("postInput");
let postsContainer = document.getElementById("postsContainer");

// ====== Pegar ID da URL ======
const params = new URLSearchParams(window.location.search);
const profileId = params.get("id"); // pode ser null

// ====== Carregar perfil ======
window.onload = function () {
  loadProfile();
  if (profileId) follow_btn(); // só mostra botão em perfis de outras pessoas
};

async function loadProfile() {
  const endpoint = profileId
    ? `http://127.0.0.1:5000/api/Search/${profileId}`
    : `http://127.0.0.1:5000/api/perfil/informacoes`;

  fetch(endpoint, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      let usuario = data.usuario;
      let posts = data.posts;

      document.getElementById("profileName").textContent = usuario.Name;
      document.querySelector(".profile-bio").textContent =
        usuario.bio || "Sem biografia ainda.";

      postsContainer.innerHTML = "";
      posts.forEach((post) => {
        const postElement = document.createElement("div");
        postElement.className = "post";
        postElement.innerHTML = `
          <div class="post-header">
            <strong>${post.user_name}</strong>
          </div>
          <p class="post-text">${post.text}</p>
          <div class="post-actions">
            ${
              profileId
                ? ""
                : `<button class="delete-btn" onclick="deletePost(${post.post_id})">
                    <i class="fa-solid fa-trash"></i> Excluir
                  </button>`
            }
          </div>
        `;
        postsContainer.appendChild(postElement);
      });

      if (profileId) hideOwnerOptions();
    })
    .catch((error) => console.error("Erro ao carregar perfil:", error));
}

// ====== Esconder botões quando não é meu perfil ======
function hideOwnerOptions() {
  document.getElementById("editProfileBtn").style.display = "none";
  document.getElementById("deleteProfileBtn").style.display = "none";
  document.querySelector(".create-post").style.display = "none";
  document.querySelector(".follow_user").style.display = "block";
  document.querySelector(".edit-pic-btn").style.display = "none";

  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((btn) => (btn.style.display = "none"));
}

// ====== Editar perfil ======
function profile_edit() {
  if (profileId) return alert("Você não pode editar outro perfil!");

  fetch("http://127.0.0.1:5000/api/perfil/edit", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      new_name: name_user.value,
      bio_user: bio.value,
    }),
  })
    .then((response) => response.json())
    .then(() => {
      alert("Perfil atualizado!");
      window.location.reload();
    })
    .catch((error) => console.error("Erro ao editar perfil:", error));
}

// ====== Criar nova postagem ======
function publish() {
  if (profileId)
    return alert("Você não pode postar no perfil de outra pessoa!");

  const text = post_text.value.trim();
  if (!text) return alert("Digite algo antes de publicar!");

  fetch("http://127.0.0.1:5000/api/Text_post/postagens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ Text: text }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.mensagem_post || "Post publicado!");
      post_text.value = "";
      window.location.reload();
    })
    .catch((error) => console.error("Erro ao publicar:", error));
}

// ====== Excluir postagem ======
function deletePost(post_id) {
  if (profileId) return alert("Você não pode excluir posts de outro usuário!");

  if (confirm("Deseja mesmo excluir esta postagem?")) {
    fetch(`http://127.0.0.1:5000/api/Text_post/delete-post/${post_id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.mensagem_delete || "Post deletado!");
        window.location.reload();
      })
      .catch((error) => console.error("Erro ao deletar post:", error));
  }
}

//
// ✅✅✅ SEGUIR / DEIXAR DE SEGUIR ✅✅✅
//

// ====== Atualizar botão ao abrir perfil ======
function follow_btn() {
  fetch(`http://127.0.0.1:5000/api/Search/${profileId}`, {
    method: "GET",
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      const btn = document.querySelector(".follow_user");

      if (data.is_following === true) {
        btn.textContent = "Deixar de seguir";
        btn.onclick = () => deixarDeSeguir(profileId);
      } else {
        btn.textContent = "Seguir";
        btn.onclick = () => seguir(profileId);
      }
    })
    .catch((e) => console.error(e));
}

// ====== Seguir ======
function seguir(userId) {
  fetch(`http://127.0.0.1:5000/api/Follow/${userId}`, {
    method: "POST",
    credentials: "include",
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.mesagem_friends) {
        alert(data.mesagem_friends);
        follow_btn();
        return;
      }

      if (data.mensage_error2) {
        alert(data.mensage_error2);
        return;
      }
    })
    .catch((e) => console.error(e));
}

// ====== Deixar de seguir ======
function deixarDeSeguir(userId) {
  fetch(`http://127.0.0.1:5000/api/Unfollow/${userId}`, {
    method: "DELETE",
    credentials: "include",
  })
    .then((r) => r.json())
    .then((data) => {
      if (data["mensage_remove-friends"]) {
        alert(data["mensage_remove-friends"]);
        follow_btn();
        return;
      }

      if (data["mensage_remove-friends-not_found"]) {
        alert(data["mensage_remove-friends-not_found"]);
      }
    })
    .catch((e) => console.error(e));
}
