
function validar() {
    var resultado = true;
    var txtNombres = document.getElementById("nombres");
    var txtApellidos = document.getElementById("apellidos");
    var selectAsunto = document.getElementById("asunto");
    var txtemail = document.getElementById("correo");
    var txtTelefono = document.getElementById("telefono");
    var radiosPreg = document.getElementsByName("pregunta");

    var letra = /^[a-z ,.'-]+$/i;
    var correo = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    var telefonoreg = /^[0-9]{10}$/g;

    limpiarMensajes();

    //validacion para nombres
    if (txtNombres.value === '') {
        resultado = false;
        mensaje("*Ingrese un Nombre", txtNombres);
    } else if (!letra.test(txtNombres.value)) {
        resultado = false;
        mensaje("*Nombre solo debe contener letras", txtNombres);
    } else if (txtNombres.value.length > 20) {
        resultado = false;
        mensaje("*Nombre maximo 20 caracteres", txtNombres);
    }

     //validacion para apellidos
     if (txtApellidos.value === '') {
        resultado = false;
        mensaje("*Ingrese un Apellido", txtApellidos);
    } else if (!letra.test(txtApellidos.value)) {
        resultado = false;
        mensaje("*Apellido solo debe contener letras", txtApellidos);
    } else if (txtApellidos.value.length > 20) {
        resultado = false;
        mensaje("*Apellido maximo 20 caracteres", txtApellidos);
    }

    //validacion email
    if (txtemail.value === "") {
        resultado = false;
        mensaje("*Ingrese un Email", txtemail);
    } else if (!correo.test(txtemail.value)) {
        resultado = false;
        mensaje("*Email invalido", txtemail);
    }

    //validacion telefono
    if (txtTelefono.value === "") {
        resultado = false;
        mensaje("*Ingrese un Telefono", txtTelefono);
    } else if (!telefonoreg.test(txtTelefono.value)) {
        resultado = false;
        mensaje("Telefono debe ser de 10 digitos", txtTelefono);
    }

    //validacion radio button
    var sel = false;
    for (let i = 0; i < radiosPreg.length; i++) {
        if (radiosPreg[i].checked) {
            sel = true;
            break;
        }
    }
    if (!sel) {
        resultado = false;
        mensaje("*Seleccione una opcion", radiosPreg[0]);
    }

    //validacion select
    if (selectAsunto.value === null || selectAsunto.value === '0') {
        resultado = false;
        mensaje("*Seleccione un Asunto", selectAsunto);
    }
    if(resultado == true){
        alert("Mensaje Enviado Exitosamente")
    }

    return resultado;
}


function mensaje(cadenaMensaje, elemento) {
    elemento.focus();
    var nodoPadre = elemento.parentNode;
    var nodoMensaje = document.createElement("span");
    nodoMensaje.innerHTML = cadenaMensaje;
    nodoMensaje.style.color = "red";
    nodoMensaje.style.display = "block";
    nodoMensaje.style.fontSize = "14px";
    nodoMensaje.setAttribute("class", "mensaje");

    nodoPadre.appendChild(nodoMensaje);

}

function limpiarMensajes() {
    var mensajes = document.querySelectorAll(".mensaje");
    for (let i = 0; i < mensajes.length; i++) {
        mensajes[i].remove();
    }

}