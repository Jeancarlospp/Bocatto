function validarReserva(){
    var resultado = true;
    var txtNombres = document.getElementById("nombres");
    var txtApellidos = document.getElementById("apellidos");
    var txtemail = document.getElementById("correo");
    var txtTelefono = document.getElementById("telefono");
    var txtFecha = document.getElementById("fecha");
    var txtHora = document.getElementById("hora");
    var selectAdulto = document.getElementById("adulto");
    var selectNinio = document.getElementById("ninio");
    var cbxOcasion = document.querySelectorAll(".oca");
    
    limpiarMensajes();
    var valNombre = nombres(txtNombres);
    var valApellido = nombres(txtApellidos);
    var valCorreo = email(txtemail);
    var valTelefono = telefono(txtTelefono);
    var valFecha = fecha(txtFecha);
    var valHora = hora(txtHora);
    var valAdulto = numPersonas(selectAdulto);
    var valNinio = numPersonas(selectNinio);
    var valOcasion = ocasionEspecial(cbxOcasion);

    if(valNombre === false || valApellido === false || valCorreo === false || valTelefono === false ||
        valFecha === false || valAdulto === false || valNinio === false || valHora === false || valOcasion === false){
        resultado = false;
    }

    if(document.getElementsByClassName("areaOca")){
        var areaOcasion = document.getElementsByClassName("areaOca");
        for (let i = 0; i < areaOcasion.length; i++) {
            console.log(areaOcasion[i].value);
            if(areaOcasion[i].value === ""){
                mensaje("Este campo es requerido", areaOcasion[i]);
                resultado = false;
                break;
            }
        }
    }
    if(resultado===true){
        enviar();
    }
    return resultado;
}

function nombres(txtVariable){
    var letra = /^[a-z ,.'-]+$/i;// letras y espacio ///^[A-Z]+$/i;// solo letras
    if (txtVariable.value === '') {
        mensaje("Este campo es requerido", txtVariable);
        return false;
    } else if (!letra.test(txtVariable.value)) {
        mensaje("Este campo solo debe contener letras", txtVariable);
        return false;
    } else if (txtVariable.value.length > 20) {
        mensaje("Este campo debe tener maximo 20 caracteres", txtVariable);
        return false;
    }
}

function email(txtemail) {
    var correo = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (txtemail.value === "") {
        mensaje("Email es requerido", txtemail);
        return false;
    } else if (!correo.test(txtemail.value)) {
        mensaje("Email no es correcto", txtemail);
        return false;
    }
}

function telefono(txtTelefono) {
    var telefonoreg = /^[0-9]{10}$/g; // para validar datos que deban tener 10 numeros
    if (txtTelefono.value === "") {
        mensaje("Teléfono es requerido", txtTelefono);
        return false;
    } else if (!telefonoreg.test(txtTelefono.value)) {
        mensaje("Teléfono debe ser de 10 digitos", txtTelefono);
        return false;
    }
}

function fecha(txtFecha) {
    var dato = txtFecha.value;
    var fechaN = new Date(dato);
    var anioN = fechaN.getFullYear();
    
    var fechaActual = new Date(); //fecha actual
    var anioA = fechaActual.getFullYear();

    if(dato === ""){
        mensaje("Fecha es requerida",txtFecha);
        return false;
    }else if(fechaN < fechaActual){
        mensaje("Fecha debe ser superior a la actual",txtFecha);
        return false;
    }else if(anioN > (anioA+2)){
        mensaje("No puede asignar una reserva mayor a 2 años",txtFecha);
        return false;
    }
}

function hora(txtHora) {
    var dato = txtHora.value;
    var separador = dato.split(":");
    horaN = parseInt(separador[0]);
    minutoN = parseInt(separador[1]);

    if(dato === ""){
        mensaje("Hora es requerida",txtHora);
        return false;
    }else if(horaN < 8 || horaN > 22){
        mensaje("Solo se reserva desde 8:00 AM hasta 10:00 PM",txtHora);
        return false;
    }else if(horaN===22 && minutoN > 0){
        mensaje("Solo se reserva desde 8:00 AM hasta 10:00 PM",txtHora);
        return false;
    }
}

function numPersonas(select) {
    if (select.value === null || select.value === '0') {
        mensaje("Debe seleccionar el número de personas", select);
        return false;
    }
}

function seleccionarCheck() {
    var checkSi = document.getElementById("ocasion1");
    var checkNo = document.getElementById("ocasion2");

    checkSi.onclick = function () {
        if(checkSi.checked != false){
            borrarOcasion();
            crearOcasion(checkSi);
            checkNo.checked = false;
        }else{
            borrarOcasion();
        }
    }

    checkNo.onclick = function() {
        if(checkNo.checked != false){
            borrarOcasion();
            checkSi.checked = false;
        }
    }
}

function crearOcasion(check) {
    checkPadre = check.parentNode;

    var nodoEspacio = document.createElement("br");
    nodoEspacio.setAttribute("class","espacioOca");
    
    var nodoTitulo = document.createElement("label");
    nodoTitulo.innerHTML = "¿Qué tipo de celebración?";
    nodoTitulo.style.fontWeight = "bold";
    nodoTitulo.setAttribute("class", "titulo");
    
    var nodoTexto = document.createElement("label");
    nodoTexto.innerHTML = "Haremos lo posible para hacer de esta ocasión algo muy especial.";
    nodoTexto.setAttribute("class", "textoOca");

    var nodoArea = document.createElement("textarea");
    nodoArea.setAttribute("class", "form-control areaOca");
    nodoArea.setAttribute("rows", "2");

    checkPadre.appendChild(nodoEspacio);
    checkPadre.appendChild(nodoTitulo);
    checkPadre.appendChild(nodoTexto);
    checkPadre.appendChild(nodoArea);
}

function borrarOcasion() {
    var espacioOca = document.querySelectorAll(".espacioOca");
    var tituloOca = document.querySelectorAll(".titulo");
    var textoOca = document.querySelectorAll(".textoOca");
    var areaOca = document.querySelectorAll(".areaOca");
    
    for (let i=0; i < espacioOca.length; i++){
        espacioOca[i].remove();
    }
    for (let i=0; i < tituloOca.length; i++){
        tituloOca[i].remove();
    }
    for (let i=0; i < textoOca.length; i++){
        textoOca[i].remove();
    }
    for (let i=0; i < areaOca.length; i++){
        areaOca[i].remove();
    }
}

function ocasionEspecial(cbxOcasion){
    var sel = false;
    for (let i = 0; i < cbxOcasion.length; i++) {
        if (cbxOcasion[i].checked) {
            sel = true;
            break;
        }
    }
    if (!sel) {
        mensaje("Este campo es requerido", cbxOcasion[0]);
        return false;
    }
}

function mensaje(cadenaMensaje, elemento) {
    elemento.focus();
    var nodoPadre = elemento.parentNode;
    
    var nodoMensaje = document.createElement("span");
    nodoMensaje.innerHTML = cadenaMensaje;
    nodoMensaje.style.color = "red";
    nodoMensaje.style.display = "block";
    nodoMensaje.setAttribute("class", "mensaje");
    
    nodoPadre.appendChild(nodoMensaje);
}

function limpiarMensajes() {
    var mensajes = document.querySelectorAll(".mensaje");
    for (let i = 0; i < mensajes.length; i++) {
        mensajes[i].remove();// remueve o elimina un elemento de mi doc html
    }
}

function enviar() {
    alert("Su reservación ha sido enviada con éxito");
}

function limpiarTodo() {
    limpiarMensajes();
    borrarOcasion();
}