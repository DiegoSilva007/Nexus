// ======= CONFIGURAÇÃO BASE =======
const API_BASE = "https://tcc-api-411090032807.southamerica-east1.run.app";

// ======= AO CARREGAR A PÁGINA =======
window.addEventListener("DOMContentLoaded", carregarFeed);

// ======= FUNÇÃO PRINCIPAL DO FEED =======
async function carregarFeed() {
  try {
    const res = await fetch(`${API_BASE}/api/Text_post/feed`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Erro ao buscar feed:", res.status);
      document.getElementById("feedContainer").innerHTML =
        "<p>Erro ao carregar o feed.</p>";
      return;
    }

    const posts = await res.json();
    console.log(posts);
    exibirFeed(posts);
  } catch (err) {
    console.error("Erro ao carregar feed:", err);
    document.getElementById("feedContainer").innerHTML =
      "<p>Erro ao carregar o feed. Verifique o console.</p>";
  }
}

// ======= EXIBIR POSTS NO FEED =======
function exibirFeed(posts) {
  const container = document.getElementById("feedContainer");
  container.innerHTML = "";

  if (!Array.isArray(posts) || posts.length === 0) {
    container.innerHTML = `
      <div class="no-posts">
        <i class="far fa-newspaper"></i>
        <p>Nenhuma postagem encontrada</p>
      </div>
    `;
    return;
  }

  posts.forEach((post) => {
    const postEl = document.createElement("div");
    postEl.className = "post";

    postEl.innerHTML = `
      <div class="post-header">
        <strong>${post.user_name}</strong>
      </div>
      <p class="post-text">${escapeHtml(post.text)}</p>

      <div class="post-actions">
        <button class="like-btn" data-id="${post.post_id}">
           <i class="fas fa-heart"></i> Curtir
        </button>
        <span id="likes-${post.post_id}">${post.likes || 0} curtidas</span>
      </div>

      <div class="comments-section">
        <ul id="comments-${post.post_id}" class="comment-list"></ul>
        <input type="text" id="comment-input-${
          post.post_id
        }" class="comment-input" placeholder="Escreva um comentário..." />
        <button class="comment-btn" data-id="${post.post_id}">Enviar</button>
      </div>
    `;

    container.appendChild(postEl);

    // eventos
    postEl
      .querySelector(".like-btn")
      .addEventListener("click", () => curtirPost(post.post_id));
    postEl
      .querySelector(".comment-btn")
      .addEventListener("click", () => comentarPost(post.post_id));

    // carrega comentários do post
    carregarComentarios(post.post_id);
  });
}

// ======= CURTIR POST =======
async function curtirPost(post_id) {
  try {
    const res = await fetch(`${API_BASE}/api/Text_post/like-post/${post_id}`, {
      method: "PUT",
      credentials: "include",
    });

    const data = await res.json();
    if (res.ok) {
      const likesEl = document.getElementById(`likes-${post_id}`);
      if (likesEl) {
        const atual = parseInt(likesEl.textContent) || 0;
        likesEl.textContent = `${atual + 1} curtidas`;
      }
    } else {
      console.error("Erro ao curtir:", data);
    }
  } catch (err) {
    console.error("Erro ao curtir post:", err);
  }
}

// ======= COMENTAR POST =======
async function comentarPost(post_id) {
  const input = document.getElementById(`comment-input-${post_id}`);
  const comentario = input.value.trim();

  if (!comentario) return alert("Digite algo antes de comentar!");

  try {
    const res = await fetch(`${API_BASE}/api/Comment/${post_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ Comentario: comentario }),
    });

    if (res.ok) {
      input.value = "";
      carregarComentarios(post_id);
    } else {
      console.error("Erro ao comentar:", res.status);
    }
  } catch (err) {
    console.error("Erro ao comentar:", err);
  }
}

// ======= CARREGAR COMENTÁRIOS =======
async function carregarComentarios(post_id) {
  try {
    const res = await fetch(`${API_BASE}/api/Comment/${post_id}`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) return;
    const comentarios = await res.json();
    const lista = document.getElementById(`comments-${post_id}`);
    lista.innerHTML = "";

    if (!comentarios.length) {
      lista.innerHTML = `<li class="no-comment">Sem comentários</li>`;
      return;
    }

    comentarios.forEach((c) => {
      const li = document.createElement("li");
      li.textContent = c.comment;
      lista.appendChild(li);
    });
  } catch (err) {
    console.error("Erro ao carregar comentários:", err);
  }
}

// ======= FUNÇÃO PARA EVITAR CÓDIGO MALICIOSO =======
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
