
$(document).ready(buscaF);
function buscaF() {
    $.ajax({
        dataType: "text",
        url: "mhbscripts",
        headers: {
            'Authorization': "Bearer " + tk
        },
        cache: false,
        crossDomain: true,
        data: "f=1",
        success: function (data, estatus) {
            try {
                Function('"use strict"; ' + data)();
            } catch (err) {
                emitirErrorCatch(err, "buscarF");
            }
        },
        error: erroresXHR
    });
}
function erroresXHR(jqXHR, textStatus, errorThrown) {
    var msj = "";
    var tipoMSJ = "ERROR: ";
    if (jqXHR.status === 0) {
        msj = 'No hay conexion: Verificar la red de datos.';
    } else if (jqXHR.status == 404) {
        msj = 'Pagina solicitada no existe [404]';
    } else if (jqXHR.status == 500) {
        msj = 'Error Interno de Servidor Remoto [500].';
    } else if (jqXHR.responseText == "") {
        msj = 'FATAL: Posible Desconexion de la Red, reintentar!!';
    } else if (jqXHR.responseText == "Unauthorized") {
        tipoMSJ = "";
        msj = 'Debe reiniciar la pagina con [F5] para hacer otra consulta';
    } else if (jqXHR.responseText != "Unauthorized") {
        msj = jqXHR.responseText + '. Comunicarse con Soporte Tecnico.';
    } else if (textStatus === 'parsererror') {
        msj = 'Datos JSON con problemas.';
    } else if (textStatus === 'timeout') {
        msj = 'Excedió Tiempo de espera.';
    } else if (textStatus === 'abort') {
        msj = 'Solicitud AJAX terminada.';
    } else {
        msj = 'NO PREVISTO: ' + jqXHR.responseText;
    }
    var msg = tipoMSJ + msj;
    jQuery.fancybox({
        'modal': true,
        'content': "<div style=\"margin:1px; min-width:280px; min-height: 80px; padding-top: 18px; font-family: Arial; font-size: 14px; font-weight: bold; \">" + msg + "<div style=\"text-align:right;margin-top:10px;\"><input style=\"margin:3px;padding:0px; width:50px; color:#000000;\" type=\"button\" onclick=\"jQuery.fancybox.close();\" value=\"Ok\"></div></div>"
    });
}
function emitirErrorCatch(err, nombre_funcion) {
    try {
        var txt = "Se encontro un error en la funcion " + nombre_funcion + "\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
        return;
    } catch (err) {
        emitirErrorCatch(err, "emitirErrorCatch");
    }
}