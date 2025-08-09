const user_name = document.getElementById("username");
const user_email = document.querySelector("#email");
const user_password = document.querySelector("#senha");
const user_age = document.querySelector("#aniversario");
const user_gender = document.querySelector(".gender");
const modal_msg = document.querySelector(".message");
const modal_cadastro = document.querySelector("#modal_cadastro");
const base_url = "http://127.0.0.1:5000";

function Sign_Up() {
  fetch(`${base_url}/Cadastro/Criar_perfil`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      UserName: user_name.value,
      Gender: user_gender.value,
      email: user_email.value,
      Password: user_password.value,
      Age: new Date(user_age.value).getFullYear(),
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.mensagem_requisito1) {
        modal_cadastro.textContent = data.mensagem_requisito1;
        modal_cadastro.show();
        setTimeout(() => modal_cadastro.close(), 3000);
      } else if (data.mensagem_requisito2) {
        modal_cadastro.textContent = data.mensagem_requisito2;
        modal_cadastro.show();
        setTimeout(() => modal_cadastro.close(), 3000);
      } else if (data.mensagem_requisito3) {
        modal_cadastro.textContent = data.mensagem_requisito3;
        modal_cadastro.show();
        setTimeout(() => modal_cadastro.close(), 3000);
      } else if (data.mensagem_requisito4) {
        modal_cadastro.textContent = data.mensagem_requisito4;
        modal_cadastro.show();
        setTimeout(() => modal_cadastro.close(), 3000);
      } else if (data.mensagem_4) {
        modal_cadastro.textContent = data.mensagem_4;
        modal_cadastro.show();
        setTimeout(() => modal_cadastro.close(), 3000);
      } else {
        window.location.href = "feed.html";
      }
    });
}
