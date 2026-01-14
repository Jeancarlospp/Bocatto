function validar() {
    
    var resultado = true;
    var txtCedula = document.getElementById("cedula");
    var txtNombres = document.getElementById("nombres");//document.querySelector("input[name='nombres']"); // reotrna el primer input que tenga name ='nombres'
    var txtApellidos = document.getElementById("apellidos");
    var txtTelefono = document.getElementById("telefono");
    var selectAreaTrabajo = document.getElementById("areatrabajo");
    var radiosGenero = document.getElementsByName("genero");// document.querySelectorAll("input[name='genero']");
    var txtemail = document.getElementById("correo");
    var txttexto = document.getElementById("texto");
    
    var letra = /^[a-z ,.'-]+$/i;// letras y espacio   
    var correo = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    var cedula = /^[0-9]{10}$/g;
    var telefono = /^[0-9]{10}$/g;

    limpiarMensajes();

    //Validacion de la cedula
    if (txtCedula.value === "") {
        resultado = false;
        mensaje("Cédula requerida", txtCedula);
    } else if (!cedula.test(txtCedula.value)) {
        resultado = false;
        mensaje("La cédula solo debe contener digitos hasta un maximo de 10", txtCedula);
    }

    //validacion nombres y apellidos
    if (txtNombres.value === '') {
        resultado = false;
        mensaje("Nombre es requerido", txtNombres);
    } else if (!letra.test(txtNombres.value)) {
        resultado = false;
        mensaje("Nombre solo debe contener letras", txtNombres);
    } else if (txtNombres.value.length > 25) {
        resultado = false;
        mensaje("Nombre maximo 25 caracteres", txtNombres);
    }

    if (txtApellidos.value === '') {
        resultado = false;
        mensaje("Nombre es requerido", txtApellidos);
    } else if (!letra.test(txtApellidos.value)) {
        resultado = false;
        mensaje("Nombre solo debe contener letras", txtApellidos);
    } else if (txtApellidos.value.length > 25) {
        resultado = false;
        mensaje("Nombre maximo 25 caracteres", txtApellidos);
    }
    
    //validacion telefono
    if (txtTelefono.value === "") {
        resultado = false;
        mensaje("Telefono requerido", txtTelefono);
    } else if (!telefono.test(txtTelefono.value)) {
        resultado = false;
        mensaje("El número de telefono debe contener 10 digitos", txtTelefono);
    }

    //validacion email
    if (txtemail.value === "") {
        resultado = false;
        mensaje("Email es requerido", txtemail);
    } else if (!correo.test(txtemail.value)) {
        resultado = false;
        mensaje("Email no es correcto", txtemail);
    }

    //validacion select
    if (selectAreaTrabajo.value === null || selectAreaTrabajo.value === '0') {
        resultado = false;
        mensaje("Debe seleccionar el área de trabajo de interes", selectAreaTrabajo);
    }

    //validacion radio button
    var sel = false;
    for (let i = 0; i < radiosGenero.length; i++) {
        if (radiosGenero[i].checked) {
            sel = true;
            break;
        }
    }
    if (!sel) {
        resultado = false;
        mensaje("Debe seleccionar un género", radiosGenero[0]);
    }

    //validacion textarea
    if (txttexto.value === '') {
        resultado = false;
        mensaje("Ingrese cargos de trabajos y nombres de negocios, digíte el no tener experiencias previas de darse el caso", txttexto);
    } else if (!letra.test(txttexto.value)) {
        resultado = false;
        mensaje("Esta sección solo debe contener letras y caracteres de puntuación", txttexto);
    } else if (txttexto.value.length > 200) {
        resultado = false;
        mensaje("Por favor digíte hasta un maximo de 200 caracteres", txttexto);
    }

    return resultado;
}

function mensaje(cadenaMensaje, elemento) {
    elemento.focus();
    var nodoPadre = elemento.parentNode;
    var nodoMensaje = document.createElement("span");
    nodoMensaje.innerHTML = cadenaMensaje;
    nodoMensaje.style.display = "block";
    nodoMensaje.style.color = "red";
    nodoMensaje.setAttribute("class", "mensaje");

    nodoPadre.appendChild(nodoMensaje);

}

function limpiarMensajes() {
    var mensajes = document.querySelectorAll(".mensaje");
    for (let i = 0; i < mensajes.length; i++) {
        mensajes[i].remove();
    }
} 