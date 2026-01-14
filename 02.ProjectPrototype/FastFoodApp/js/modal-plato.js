// ...existing code...
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('modalPlato');
  const modalImg = document.getElementById('modal-img');
  const modalNombre = document.getElementById('modal-nombre');
  const modalDescripcion = document.getElementById('modal-descripcion');
  const modalPrecio = document.getElementById('modal-precio');
  const modalCantidad = document.getElementById('modal-cantidad');
  const modalComentarios = document.getElementById('modal-comentarios');
  const modalAgregar = document.getElementById('modal-agregar');
  const modalClose = document.getElementById('modal-close');
  
  // Elementos para el cálculo de precios
  const precioBaseValor = document.getElementById('precio-base-valor');
  const precioExtrasValor = document.getElementById('precio-extras-valor');
  const precioTotalValor = document.getElementById('precio-total-valor');
  const checkboxExtras = document.querySelectorAll('.extra-item input[type="checkbox"]');
  const extrasSection = document.querySelector('.extras-section');
  
  let precioBase = 0;

  // Función para calcular precios
  function calcularPrecios() {
    let precioExtras = 0;
    
    checkboxExtras.forEach(checkbox => {
      if (checkbox.checked) {
        precioExtras += parseFloat(checkbox.dataset.precio) || 0;
      }
    });
    
    const cantidad = parseInt(modalCantidad.value) || 1;
    const subtotal = precioBase + precioExtras;
    const total = subtotal * cantidad;
    
    precioBaseValor.textContent = `$${precioBase.toFixed(2)}`;
    precioExtrasValor.textContent = `$${precioExtras.toFixed(2)}`;
    precioTotalValor.textContent = `$${total.toFixed(2)}`;
  }

  // Función para limpiar extras seleccionados
  function limpiarExtras() {
    checkboxExtras.forEach(checkbox => {
      checkbox.checked = false;
    });
  }

  // Función para mostrar/ocultar extras según la categoría
  function manejarExtrasSegunCategoria(categoria) {
    const categoriaSinExtras = ['Postres', 'Bebidas'];
    
    if (categoriaSinExtras.includes(categoria)) {
      extrasSection.style.display = 'none';
    } else {
      extrasSection.style.display = 'block';
    }
  }

  // Event listeners para recalcular precios
  checkboxExtras.forEach(checkbox => {
    checkbox.addEventListener('change', calcularPrecios);
  });
  
  modalCantidad.addEventListener('input', calcularPrecios);

  // Abrir modal al hacer click en un .item
  document.querySelectorAll('.lista-platos .item').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', function (e) {
      // evitar que clicks en links dentro interfieran
      if (e.target.tagName.toLowerCase() === 'a') e.preventDefault();

      const imgEl = item.querySelector('img');
      const enlaces = item.querySelectorAll('a');
      const nombre = enlaces[0] ? enlaces[0].textContent.trim() : '';
      const precio = enlaces[1] ? enlaces[1].textContent.trim() : '';
      const descripcion = item.getAttribute('data-descripcion') || item.getAttribute('data-contenido') || imgEl.alt || '';
      const categoria = item.getAttribute('data-categoria') || '';

      modalImg.src = imgEl ? imgEl.src : '';
      modalImg.alt = nombre;
      modalNombre.textContent = nombre;
      modalPrecio.textContent = precio;
      modalDescripcion.textContent = descripcion;
      modalCantidad.value = 1;
      modalComentarios.value = '';

      // Extraer precio base y configurar cálculos
      const precioTexto = precio.replace('$', '');
      precioBase = parseFloat(precioTexto) || 0;
      
      // Manejar extras según la categoría
      manejarExtrasSegunCategoria(categoria);
      
      // Limpiar extras y recalcular
      limpiarExtras();
      calcularPrecios();

      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  // Cerrar modal
  function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }
  modalClose.addEventListener('click', closeModal);
  window.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  // Botón agregar (aquí puedes añadir al carrito, localStorage, petición fetch, etc.)
  modalAgregar.addEventListener('click', function () {
    // Obtener extras seleccionados
    const extrasSeleccionados = [];
    let precioExtras = 0;
    
    checkboxExtras.forEach(checkbox => {
      if (checkbox.checked) {
        const label = checkbox.nextElementSibling;
        const nombreExtra = label.textContent.split('+$')[0].trim();
        const precioExtra = parseFloat(checkbox.dataset.precio) || 0;
        
        extrasSeleccionados.push({
          nombre: nombreExtra,
          precio: precioExtra
        });
        precioExtras += precioExtra;
      }
    });
    
    const cantidad = Number(modalCantidad.value) || 1;
    const precioUnitario = precioBase + precioExtras;
    const precioTotal = precioUnitario * cantidad;
    
    const item = {
      nombre: modalNombre.textContent,
      precioBase: precioBase,
      extras: extrasSeleccionados,
      precioExtras: precioExtras,
      precioUnitario: precioUnitario,
      cantidad: cantidad,
      precioTotal: precioTotal,
      comentarios: modalComentarios.value || '',
      img: modalImg.src
    };
    
    // Ejemplo simple: guardar en localStorage "cart" (array)
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));

    // respuesta breve al usuario (puedes reemplazar por UI)
    let mensaje = `Agregado: ${item.nombre} x${item.cantidad}`;
    if (extrasSeleccionados.length > 0) {
      mensaje += ` (con ${extrasSeleccionados.length} extra${extrasSeleccionados.length > 1 ? 's' : ''})`;
    }
    mensaje += ` - Total: $${precioTotal.toFixed(2)}`;
    
    alert(mensaje);
    closeModal();
  });
});
// ...existing code...