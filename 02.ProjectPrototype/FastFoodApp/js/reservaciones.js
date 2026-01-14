// Sistema de Reservaciones - La Parada
// Datos de ejemplo de comentarios por ambiente
const comentariosPorAmbiente = {
    'salon-principal': [
        {
            usuario: 'María González',
            fecha: '15 Oct 2025',
            rating: 5,
            texto: 'Excelente ambiente para una cena romántica. La atención fue impecable y la comida deliciosa. Totalmente recomendado.'
        },
        {
            usuario: 'Carlos Mendoza',
            fecha: '10 Oct 2025',
            rating: 5,
            texto: 'Perfecto para celebraciones íntimas. El servicio es excepcional y la atmósfera muy acogedora.'
        },
        {
            usuario: 'Ana Torres',
            fecha: '05 Oct 2025',
            rating: 4,
            texto: 'Muy buena experiencia. La música ambiental y la decoración crean un ambiente muy agradable.'
        }
    ],
    'terraza-vip': [
        {
            usuario: 'Roberto Silva',
            fecha: '18 Oct 2025',
            rating: 5,
            texto: 'La terraza VIP superó nuestras expectativas. La vista es espectacular y el servicio exclusivo hace que valga totalmente la pena.'
        },
        {
            usuario: 'Laura Martínez',
            fecha: '12 Oct 2025',
            rating: 5,
            texto: 'Celebramos nuestro aniversario aquí y fue perfecto. La decoración personalizada y la atención al detalle son increíbles.'
        },
        {
            usuario: 'Diego Ramírez',
            fecha: '08 Oct 2025',
            rating: 5,
            texto: 'Ambiente premium en todo sentido. Ideal para ocasiones especiales. El staff es muy profesional.'
        }
    ],
    'salon-familiar': [
        {
            usuario: 'Patricia Vargas',
            fecha: '16 Oct 2025',
            rating: 5,
            texto: 'Perfecto para ir con niños. El área de juegos mantuvo a mis hijos entretenidos mientras disfrutábamos la comida.'
        },
        {
            usuario: 'Fernando López',
            fecha: '11 Oct 2025',
            rating: 4,
            texto: 'Espacio amplio y cómodo para grupos grandes. El menú infantil es variado y saludable.'
        },
        {
            usuario: 'Sofía Herrera',
            fecha: '06 Oct 2025',
            rating: 5,
            texto: 'Organizamos la reunión familiar aquí y fue excelente. Todos quedamos muy contentos con la atención y la comida.'
        }
    ],
    'bar-lounge': [
        {
            usuario: 'Andrés Morales',
            fecha: '17 Oct 2025',
            rating: 5,
            texto: 'El mejor bar lounge de la zona. Los cócteles son espectaculares y la música en vivo es increíble.'
        },
        {
            usuario: 'Valentina Cruz',
            fecha: '13 Oct 2025',
            rating: 5,
            texto: 'Ambiente nocturno perfecto. El happy hour ofrece excelentes promociones y el bartender es muy creativo.'
        },
        {
            usuario: 'Javier Ruiz',
            fecha: '09 Oct 2025',
            rating: 4,
            texto: 'Gran lugar para una salida con amigos. La variedad de bebidas es impresionante y el ambiente muy relajado.'
        }
    ]
};

// Datos de mesas reservadas (simulación para frontend)
const reservasExistentes = {
    '2025-10-20': {
        '19:00': ['salon-principal', 'terraza-vip'],
        '20:00': ['bar-lounge'],
        '21:00': ['salon-familiar']
    },
    '2025-10-21': {
        '13:00': ['salon-principal'],
        '19:00': ['terraza-vip', 'salon-familiar'],
        '20:30': ['bar-lounge']
    }
};

let ambienteSeleccionado = '';
let usuarioLogueado = false; // Se debe conectar con el sistema de login real

// Función para abrir el modal de reserva
function abrirModalReserva(ambiente) {
    ambienteSeleccionado = ambiente;
    const modal = document.getElementById('modalReserva');
    const titulo = document.getElementById('modalAmbienteTitulo');
    
    // Actualizar título según el ambiente
    const titulos = {
        'salon-principal': 'Reservar Mesa - Salón Principal',
        'terraza-vip': 'Reservar Mesa - Terraza VIP',
        'salon-familiar': 'Reservar Mesa - Salón Familiar',
        'bar-lounge': 'Reservar Mesa - Bar Lounge'
    };
    
    titulo.textContent = titulos[ambiente] || 'Reservar Mesa';
    
    // Cargar comentarios del ambiente
    cargarComentarios(ambiente);
    
    // Configurar fecha mínima (hoy)
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.setAttribute('min', hoy);
    
    modal.style.display = 'block';
}

// Función para cerrar el modal de reserva
function cerrarModalReserva() {
    const modal = document.getElementById('modalReserva');
    modal.style.display = 'none';
    document.getElementById('formReserva').reset();
    document.getElementById('disponibilidadTexto').textContent = 'Selecciona fecha y hora para verificar disponibilidad';
    document.getElementById('disponibilidadTexto').parentElement.className = 'disponibilidad-info';
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modalReserva = document.getElementById('modalReserva');
    if (event.target === modalReserva) {
        cerrarModalReserva();
    }
}

// Función para cargar comentarios
function cargarComentarios(ambiente) {
    const comentariosLista = document.getElementById('comentariosLista');
    const comentarios = comentariosPorAmbiente[ambiente] || [];
    
    if (comentarios.length === 0) {
        comentariosLista.innerHTML = '<p style="color: #888; text-align: center;">No hay reseñas aún para este ambiente.</p>';
        return;
    }
    
    let html = '';
    comentarios.forEach(comentario => {
        const estrellas = '★'.repeat(comentario.rating) + '☆'.repeat(5 - comentario.rating);
        html += `
            <div class="comentario-item">
                <div class="comentario-header">
                    <span class="comentario-usuario">${comentario.usuario}</span>
                    <span class="comentario-fecha">${comentario.fecha}</span>
                </div>
                <div class="comentario-rating">
                    ${[...Array(comentario.rating)].map(() => '<i class="fa fa-star"></i>').join('')}
                    ${[...Array(5 - comentario.rating)].map(() => '<i class="fa fa-star-o"></i>').join('')}
                </div>
                <p class="comentario-texto">${comentario.texto}</p>
            </div>
        `;
    });
    
    comentariosLista.innerHTML = html;
}

// Función para verificar disponibilidad
function verificarDisponibilidad() {
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const disponibilidadDiv = document.querySelector('.disponibilidad-info');
    const disponibilidadTexto = document.getElementById('disponibilidadTexto');
    const btnConfirmar = document.querySelector('.btn-confirmar-reserva');
    
    if (!fecha || !hora) {
        disponibilidadTexto.textContent = 'Selecciona fecha y hora para verificar disponibilidad';
        disponibilidadDiv.className = 'disponibilidad-info';
        btnConfirmar.disabled = false;
        return;
    }
    
    // Verificar si existe reserva
    const reservado = reservasExistentes[fecha]?.[hora]?.includes(ambienteSeleccionado);
    
    if (reservado) {
        disponibilidadTexto.textContent = '⚠️ No disponible - Esta mesa ya está reservada para la fecha y hora seleccionadas';
        disponibilidadDiv.className = 'disponibilidad-info no-disponible';
        btnConfirmar.disabled = true;
    } else {
        disponibilidadTexto.textContent = '✓ ¡Disponible! Puedes proceder con tu reserva';
        disponibilidadDiv.className = 'disponibilidad-info disponible';
        btnConfirmar.disabled = false;
    }
}

// Event listeners para verificar disponibilidad
document.addEventListener('DOMContentLoaded', function() {
    const fechaInput = document.getElementById('fecha');
    const horaSelect = document.getElementById('hora');
    
    if (fechaInput) {
        fechaInput.addEventListener('change', verificarDisponibilidad);
    }
    
    if (horaSelect) {
        horaSelect.addEventListener('change', verificarDisponibilidad);
    }
    
    // Manejar envío del formulario
    const formReserva = document.getElementById('formReserva');
    if (formReserva) {
        formReserva.addEventListener('submit', function(e) {
            e.preventDefault();
            confirmarReserva();
        });
    }
});

// Función para confirmar reserva
function confirmarReserva() {
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const personas = document.getElementById('personas').value;
    const ocasion = document.getElementById('ocasion').value;
    const comentarios = document.getElementById('comentarios').value;
    
    // Validar que todos los campos requeridos estén completos
    if (!fecha || !hora || !personas) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }
    
    // Aquí se conectaría con el backend para guardar la reserva
    // Por ahora, solo mostramos un mensaje de confirmación
    
    const ambientes = {
        'salon-principal': 'Salón Principal',
        'terraza-vip': 'Terraza VIP',
        'salon-familiar': 'Salón Familiar',
        'bar-lounge': 'Bar Lounge'
    };
    
    const mensaje = `
        ¡Reserva Confirmada! 
        
        Ambiente: ${ambientes[ambienteSeleccionado]}
        Fecha: ${new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        Hora: ${hora}
        Personas: ${personas}
        ${ocasion ? `Ocasión: ${ocasion}` : ''}
        ${comentarios ? `Comentarios: ${comentarios}` : ''}
        
        Te esperamos en La Parada!
    `;
    
    alert(mensaje);
    
    // Simular que la reserva fue guardada
    if (!reservasExistentes[fecha]) {
        reservasExistentes[fecha] = {};
    }
    if (!reservasExistentes[fecha][hora]) {
        reservasExistentes[fecha][hora] = [];
    }
    reservasExistentes[fecha][hora].push(ambienteSeleccionado);
    
    cerrarModalReserva();
}

// Función para verificar si el usuario está logueado antes de comentar
function verificarLogin() {
    // Verificar si el usuario está logueado
    // Por ahora simulamos que no está logueado y abrimos el modal de login
    if (!usuarioLogueado) {
        // Abrir el modal de login existente
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'flex';
        }
        alert('Debes iniciar sesión para dejar una reseña');
    } else {
        // Si está logueado, abrir formulario para comentar
        abrirFormularioComentario();
    }
}

// Función para abrir formulario de comentario (cuando el usuario esté logueado)
function abrirFormularioComentario() {
    // Esta función se implementará cuando se tenga el sistema de autenticación
    alert('Formulario de reseña (funcionalidad disponible próximamente con autenticación)');
}
