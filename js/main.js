const startGameBtn = document.getElementById("start-game");
const howToPlayBtn = document.getElementById("how-to-play");
const menu = document.getElementById("menu");
const game = document.getElementById("game-container");

startGameBtn.addEventListener("click", (e)=>{
	e.preventDefault();
	menu.classList.add("hide");
	game.classList.remove("hide");
	setup();
});

howToPlayBtn.addEventListener("click", (e)=>{
	e.preventDefault();
	howToPlayModal.classList.remove("hide");
});
