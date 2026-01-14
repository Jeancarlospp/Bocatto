let list = document.querySelectorAll('.tipo-item');
let item = document.querySelectorAll('.item');

for (let i = 0; i < list.length; i++) {
	list[i].addEventListener('click', function () {
		for (let j = 0; j < list.length; j++) {
			list[j].classList.remove('tipo-item_activado');
		}
		this.classList.add('tipo-item_activado');

		let filtro = this.getAttribute('data-categoria');

		for (let k = 0; k < item.length; k++) {
			item[k].classList.remove('oculto');
			item[k].classList.add('oculto');

			if (item[k].getAttribute('data-categoria') == filtro || filtro == "Todo") {
				item[k].classList.remove('oculto');
				item[k].classList.add('tipo-item_activado');
			}
		}
	})
}