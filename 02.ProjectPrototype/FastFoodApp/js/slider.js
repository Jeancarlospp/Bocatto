const slider = document.querySelector("#slider");
let sliderSection = document.querySelectorAll(".slider_section");
let sliderSectionLast = sliderSection[sliderSection.length -1];

const btnDerecha = document.querySelector("#btn_derecha");
const btnIzquierda =  document.querySelector("#btn_izquierda");

slider.insertAdjacentElement('afterbegin', sliderSectionLast);

function Siguiente(){
	let sliderSectionFirst = document.querySelectorAll(".slider_section")[0];
	slider.style.marginLeft = "-200%";
	slider.style.transition = "all 0.5s";
	setTimeout(function(){
		slider.style.transition = "none";
		slider.insertAdjacentElement('beforeend', sliderSectionFirst);
		slider.style.marginLeft = "-100%"
	}, 500);
}


function Anterior(){
	let sliderSection = document.querySelectorAll(".slider_section");
	let sliderSectionLast = sliderSection[sliderSection.length -1];
	slider.style.marginLeft = "0";
	slider.style.transition = "all 0.5s"
	setTimeout(function(){
		slider.style.transition = "none";
		slider.insertAdjacentElement('afterbegin', sliderSectionLast);
		slider.style.marginLeft = "-100%";
	}, 500);
}

// Only add event listeners if buttons exist
if(btnDerecha) {
	btnDerecha.addEventListener('click', function(){
		Siguiente();
	});
}

if(btnIzquierda) {
	btnIzquierda.addEventListener('click', function(){
		Anterior();
	});
}

setInterval(function(){
	Siguiente();
}, 4000);
