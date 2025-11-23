const username = document.querySelector(".name");
const password = document.querySelector(".password");
const modal = document.querySelector("#user_not_found");
const base_url = "http://127.0.0.1:5000";

function login() {
  fetch(`${base_url}/Login/entrar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Name: username.value,
      Password: password.value,
    }),
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.mensagem_login) {
        window.location.href = "feed.html";
      } else {
        modal.show();
        setTimeout(() => modal.close(), 3000);
      }
    });
}
