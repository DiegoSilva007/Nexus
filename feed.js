const modal_feed = document.getElementById("welcome_modal");
function welcome() {
  modal_feed.show();
  setTimeout(() => modal_feed.close(), 3000);
}
