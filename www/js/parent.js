// ++++++++ VARIABLES GLOBALES ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ****** DEL USUARIO *************************************************************************
var idUsuario=0; // id del usuario identificado
var idProcuradorUsuario=0;
var idArea=0; // id Area al que pertencece
var formatoInformeArea=""; // guarda el formato del informe segun el area del usuario
var nombreArea="";
var perfilUsuario1=0; // Perfil principal del usuario
var perfilUsuario2=0;
var perfilUsuario3=0;
var nombreUsuario; // nombre completo del usuario
var idLocal = 0; // id del local donde pertenece el usuario
var localRemoto; // es remoto = S / No es remoto = N
// ********************************************************************************************

// ****** PERIODO DE AUTOSEGURO *****************************
var idPeriodo = 0; // id del periodo 
var codPeriodo; // codigo del periodo
var fechaInicioPeriodo; // Fecha de inicio del PERIODO
// **********************************************************

// ******* VARIABLES DE AYUDA *****************************************************************
var idNotificaciones=new Array();
var codigoEventoNotificacion;
var fechaEnvioNotificaciones; // contiene la fecha de la ultima generacion de notificaciones
var notificacionEventoActual;
var destinatariosNotificaciones;
var notificacionesPendientes = new Array();
// ********************************************************************************************

// ***** TIMERS JAVASCRIPT *******************************************************************
var timerHoraActualizacion; // Actualiza la hora de conexion del usuario
var timerAlerta; // Cambia de color de amarillo a blanco y viceversa cada 3 milisegundos a las alertas de Expendientes pendientes
var timerAlertaCrita; // Cambia de color amarillo a blanco y viceversa cada 3 milisegundos a las alertas de Expedientes con tiempo critico. 
var timerBuscarExpedientesPendientes; // Busca expedientes pendientes y con tiempo critico
//********************************************************************************************

//****** VARIABLES ASOCIADAS AL MENU DE OPCIONES **************************************************************
var opcionDefault="movimiento_expedientes.html"; // opcion del menu que se carga cuando se inicia el sistema.
// ************************************************************************************************************

//******* VARIABLES ASOCIADAS AL MODULO DE TRAMITE DOCUMENTARIO ***********************************************
var tiempoCritico=0; // tiempo critico para alertar expedientes por vencer su tiempo de respuesta 
var usuario_Notificar1=0;
var usuario_Notificar2=0;
//************************************************************************************************************

//*****COD DE EVENTO PRE-SELECCIONADO*******************
var codEventoSeleccionado = "";
cargarInicio(function(){ // Se cargan las funciones iniciales por defecto
	try{
		cargarImagenesDefaultCabecera();
        activarAdvertencia(true);
        var arrayDatosUsuario = [arrayResponse];
        cargarDatosUsuario(arrayDatosUsuario, function(){
            ingresarAsistencia(function(){
                activarTimers();
                cargarMenuOpciones(perfilUsuario1, perfilUsuario2, perfilUsuario3); // consulta por el menu destinado  para el usuario identificado
            })
        })
	}catch(err){
		emitirErrorCatch(err,"funcion cargar Inicio")
	}
});
/* @cargarImagenesDefaultCabecera: carga iconos por defecto en la cabecera del sistema */
function cargarImagenesDefaultCabecera(){
    $("#idAyuda").attr("src","images/help.png");
    $("#idBtnCerrarSesion").attr("src", "images/salir.png");
}

/* @decoficarDatosPassport : Convierte en una cadena JSON con los datos de usuario obtenidos despues de validarse sus credenciales con PASSPORTJS.
    PARAMETROS:
     - data: datos del usuario
    RETURN: String JSON de los datos del usuario
*/ 
function decoficarDatosPassport(data){
  try{
    var e = document.createElement('div');
    e.innerHTML = data;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
  }catch(err){
      emitirErrorCatch(err, "decoficarDatosPassport");
  }
}

/* @activarAdvertencia: activa o desactiva la advertencia al salir del sistema sin cerrar sesion
     PARAMETROS:
      - estado (Boleano) : true= activa, false: desactiva
*/
function activarAdvertencia(estado){
    try{
        if(estado){
            window.onbeforeunload=function(){ // Activa advertencia al intenta salir del sistema cerrando la pestaña del navegador 
                return "¡¡ Para salir del sistema, primero debe cerrar su sesion !!";
            }   
        }else{
            window.onbeforeunload=null;
        }
    }catch(err){
        emitirErrorCatch(err, "activarAdvertencia")
    }
}

/*
  @cargarUsuariosConectados: Busca en la BD los usuarios conectados
    RETURN: Devuelve un array JSON de los usuarios conectados. Este JSON se envia en los parametros de la funcion cargarListaDeUsuariosConectados
*/
function cargarUsuariosConectados(){ // busca a todos los usuarios conectados
    try{
        var parametros="&idUsuario="+idUsuario;
        consultarWebServiceGet("getUsuariosConectados", parametros, cargarListaDeUsuariosConectados, false);
    }catch (err){
        emitirErrorCatch(err, "cargarUsuariosConectados")
    }
}

/*  @cargarListaDeUsuariosConectados: carga la lista de los usuarios conectados
     PARAMETROS:
      - data: Array JSON de los usuarios conectados
*/
function cargarListaDeUsuariosConectados(data){
    try{
        var tbody=$("#conectados > tbody");
        tbody.html("");
        if(data.length==0){
            tbody.append("<tr style='color:#ffffff; font-size:11px;'>" +
                "<td style='font-weight:bold; text-align:center;'>NO HAY USUARIOS CONECTADOS</td>" +
                "</tr>");
        }else{
            for(var i=0; i<data.length; i++){
                tbody.append("<tr style='color:#ffffff; font-size:11px;'>" +
                    "<td style='text-align: center; vertical-align: middle;'><img src='images/user.png' width='15' height='15'></td>" +
                    "<td><strong>"+data[i].UName+"<strong></td>" +
                    "</tr>");
            }
        }
    }catch (err){
        emitirErrorCatch(err, "cargarListaDeUsuariosConectados")
    }
}

/* @cargarDatosUsuario: carga la informacion del usuario en la cabecera del sistema y las variables globales del sistema.
    Paramatros:
    - data: array json de los datos del usuario obtenidos al validar las credenciales, 
    - callback: funcion que se ejecuta despues de cargar la informacion
*/
function cargarDatosUsuario(data, callback){
    try{
        //ASIGNA VALORES A LAS VARIABLES GLOBALES DEL USUARIO Y DEL SISTEMA
        /* Variables relacionadas al Usuario */
        idUsuario=data[0].idUsuario;
        if(data[0].idProcurador>0){
            idProcuradorUsuario=data[0].idProcurador;
        }
        idArea=data[0].idArea;
        if(idArea==1){ // Area Legal
            opcionDefault="agenda.html"; // Opcion por defecto al abrirse el sistema
        }
        nombreArea=data[0].nombreArea; // Nombre del area del usuario
        formatoInformeArea=data[0].plantilla; // Plantilla del informe del area del usuario
        perfilUsuario1=data[0].idPerfil1;
        perfilUsuario2=data[0].idPerfil2;
        perfilUsuario3=data[0].idPerfil3;
        nombreUsuario = data[0].Nombres+", "+data[0].Apellidos;
        idLocal = data[0].idLocal;                
        localRemoto=data[0].localRemoto;
        // consulta variable globales del Sistema:
        consultarWebServiceGet("getVariablesGlobales", "", function(datosVariable){
            tiempoCritico=datosVariable[0].diasAnticipa;
            usuario_Notificar1=datosVariable[0].idUsuarioNotificar1;
            usuario_Notificar2=datosVariable[0].idUsuarioNotificar2;
            // consulta por los datos del periodo actual
            consultarWebServiceGet("getPeriodoActual", "", function(datosPeriodo){
                idPeriodo = datosPeriodo[0].idPeriodo;
                codPeriodo = agregarCEROaLaIzquierda(datosPeriodo[0].codPeriodo);
                fechaInicioPeriodo=fechaFormateada(datosPeriodo[0].inicio, false, false);
                fancyAlertWait("Bienvenido "+nombreUsuario);
                // Obteniendo Fecha y hora de ingreso al sistema:
                var date=new Date();
                var solofecha=convertirAfechaString(date, false);
                var AMPM="am.";
                var soloHora=date.getHours();
                var soloMinutos=agregarCEROaLaIzquierda(date.getMinutes());
                if(soloHora>11){
                    if(soloHora>12){
                        soloHora=soloHora-12;
                    }
                    AMPM="pm.";
                }
                var horaCompleta=agregarCEROaLaIzquierda(soloHora)+":"+soloMinutos+" "+AMPM;
                var fechaIngreso = solofecha+" "+horaCompleta;
                /*--------- CARGA LA CABECERA HTML DEL SISTEMA -------------------*/
                labelTextWebPlus("datosUsuario", nombreUsuario); // nombre de usuario
                labelTextWebPlus("idAreaUsuario", nombreArea);
                labelTextWebPlus("fechaSistema", fechaIngreso)
                labelTextWebPlus("idLocal", "LOCAL : "+data[0].nombreLocal)// muestra nombre del local
                labelTextWebPlus("idDireccion", data[0].direccion)// muestra la direccion del local
                labelTextWebPlus("idCodPeriodo", "PERIODO "+codPeriodo)// muestra el codigo del periodo
                labelTextWebPlus("idFechaInicio","Inicio : "+fechaInicioPeriodo)// muestra la fecha de inicio del periodo
                $("#logoEscuela").attr("src","images/logo.png"); // carga el logo de Autoseguro
                /* -------- TERMINO DE CARGAR LA CABECERA --------------------*/
                if(typeof callback == "function"){
                    callback();
                }
            });
        });
    }catch(err){
        emitirErrorCatch(err, "cargarDatosUsuario")
    }
}

/* @activarTimers: activa los timers:
    - Usuarios conectados, 
    - Expedientes pendientes 
    - Expedientes con tiempo critico
    - Ultima conexion del usuario
*/
function activarTimers(){
    try{
        setInterval(cargarUsuariosConectados, 30000); // Actualiza la lista de usuarios conectados cada 30 segundos
        timerBuscarExpedientesPendientes=setInterval(function(){
            buscarExpedientesPendientes(); // busca y muestra expedientes pendientes
            buscarExpedientesEnTiempoCritico(); // busca y muestra expedientes en tiempo critico
        }, 30000);
        declararTimerHoraConexion(); // timer que actualiza cada 30 segundos la conexion del usuario
    }catch(err){
        emitirErrorCatch(err, "activarTimers")
    }
}

/* @buscarExpedientesEnTiempoCritico: Busca los expedientes que estan en tiempo critico del usuario y 
    muestra la alerta en la cabecera del sistema.
*/
function buscarExpedientesEnTiempoCritico(){
    try{
        var esUsuarioAnotificar=idUsuario;
        if(usuario_Notificar1==idUsuario || usuario_Notificar2 == idUsuario){ // si es un usuario a notificar envia el id del usuario, sino envia vacio
            esUsuarioAnotificar="T"; // Revisa de todos los expedientes T=TODOS
        }
        var parametros="&esUsuarioAnotificar="+esUsuarioAnotificar+
            "&tiempoCritico="+tiempoCritico;
        consultarWebServiceGet("getExpedientesCriticos",parametros, function(data){
            cargarAlertaEfecto(data.length, timerAlertaCrita, "Exped Critico(s)", "idExpedientesCriticos" );
        }, false);
    }catch(err){
        emitirErrorCatch(err, "buscarExpedientesEnTiempoCritico")
    }
}

/* @cargarExpedientesCriticos: redireciona a la opcion del menu "Expedientes Criticos" 
    para visualizar a detalle la lista de los expedientes criticos del usuario.
*/
function cargarExpedientesCriticos(){
    try{
        var mensaje = $("#idExpedientesCriticos").children(0).find("span").html();
        if(mensaje!=""){ // si hay un mensaje abre la opcion para ver expedientes en tiempo critico
            fancyConfirm("¿Deseas revisar los expedientes en estado critico? , ¡Asegurese de haber guardado todas sus tareas!", function(rpta){
                if(rpta){
                    for(var i=0; i<arrayOpcionesUsuario.length; i++){
                        if(arrayOpcionesUsuario[i].href=="expedientes_criticos.html"){ // busca la opcion de Expedientes criticos
                            cargarPagina(arrayOpcionesUsuario[i].idMenu);
                            break;
                        }
                    }
                }
            });
        }        
    }catch(err){
        emitirErrorCatch(err, "cargarExpedientesCriticos")
    }
}

/* @buscarExpedientesEnTiempoCritico: Busca los expedientes pendientes por recibir del usuario y 
   muestra la alerta en la cabecera del sistema.
*/
function buscarExpedientesPendientes(){
    try{
        var parametros="&idUsuario="+idUsuario;
        consultarWebServiceGet("getExpedientesPendientes", parametros, function(data){
            notificacionesPendientes=data;            
            cargarAlertaEfecto(data.length, timerAlerta, "Expediente(s) pendiente(s)", "idExpedientePrevio" );
        }, false)
    }catch(err){
        emitirErrorCatch(err, "buscarExpedientesPendientes")
    }
}

/* @abrirExpedientesPendientes: Abre una ventana popup para carga el detalle de los expedientes pendientes de recibir.
*/
function abrirExpedientesPendientes(){
    try{
        if(notificacionesPendientes.length>0){
            abrirVentanaFancyBox(590, 386, "expedientes_pendientes", true)
        }
    }catch(err){
        emitirErrorCatch(err, "abrirExpedientesPendientes")
    }    
}

/* @cargarAlertaEfecto: carga la alerta de los expedientes pendientes y en tiempo critico, parpadea la letra de la alerta
    cambiando de color de amarillo a blanco.
    PARAMETROS:
     - cantidad: Numero de expedientes pendientes / o en tiempo critico
     - timer: timer que guarda el efecto de cambio de color (Blanco - Amarillo)
     - tipoMensaje: Mensaje que se muestra
     - idLabel: label donde se carga la alerta-mensaje
*/
function cargarAlertaEfecto(cantidad, timer, tipoMensaje, idLabel ){ // Carga la alerta de expedientes pendientes
    try{
        // Reinicia:
        clearInterval(timer);
        $("#"+idLabel).children(0).find("span").css("color", "white");        
        //***************************************
        var color="";
        var mensaje="";
        if(cantidad>0){
            color="yellow";
            mensaje="["+cantidad+" "+tipoMensaje+"]";
            //*** TIMER ENCIENDE Y APAGA
            timer=setInterval(function(){
                var spanMensaje=$("#"+idLabel).children(0).find("span");
                var colorActual=spanMensaje.css("color");
                if(colorActual=='rgb(255, 255, 0)'){ // si es amarillo
                    spanMensaje.css("color", "white"); // Pinta blanco
                }else{ // sino
                    spanMensaje.css("color", "yellow"); // Pinta amarillo
                }        
            }, 300) // cada 3 milisegundo
            //** FIN DE TIMER
        }else{
            color="white";
            //mensaje="No hay Expedientes pendientes";
            clearInterval(timer);
        }
        var spanMensaje=$("#"+idLabel).children(0).find("span");
        spanMensaje.css("color", color);
        labelTextWebPlus(idLabel, mensaje)
    }catch(err){
        emitirErrorCatch(err, "emitirErrorCatch");
    }
}

/* @ingresarAsistencia: registra la asistencia del usuario
    PARAMETROS:
      - callback: funcion que se ejecuta despues de registrar la asistencia del usuario
*/
function ingresarAsistencia(callback){ // Despues que el usuario se ha identificado inserta su asistencia
    try{
        var esUsuarioTSIGO="F"; // false
        if(perfilUsuario1=='2' || perfilUsuario2=='2' || perfilUsuario3=='2'){ // 2 = usuario TSIGO; Identifica si el usuario es TSIGO
            esUsuarioTSIGO="T"; // True; es usuario TSIGO
        }
        var parametros="&idUsuario="+idUsuario+
            "&tipo=E"+
            "&esUsuarioTSIGO="+esUsuarioTSIGO;
        consultarWebServiceGet("insertarAsistencia", parametros, function(data){
            cargarListaDeUsuariosConectados(data);
            if(typeof callback == "function"){
                callback();
            }
        });
    }catch (err){
        emitirErrorCatch(err, "ingresarAsistencia")
    }
}

/* @declararTimerHoraConexion: declara el timer para registrar la ultima conexion del usuario
*/
function declararTimerHoraConexion(){ // Declara timer para actualizar la ultima fecha de conexion del usuario
    try{
        timerHoraActualizacion = setInterval(function(){actualizarFechaConexion();},15000); // actualiza la fecha de conexion del usuario cada 15 segundos
    }catch (err){
        emitirErrorCatch(err, "declararTimerHoraConexion")
    }
}

/* @actualizarFechaConexion: registra la ultima fecha de conexion del usuario
*/
function actualizarFechaConexion(){
    try{
        var parametros="&idUsuario="+idUsuario;
        consultarWebServiceGet("actualizarFechaConexion", parametros, function(data){}, false);
    }catch (err){
        emitirErrorCatch(err, "actualizarFechaConexion")
    }
}
/* @salirDelSistema: Finaliza la sesion de un usuario
*/ 
function salirDelSistema(){
    try{
        if(perfilUsuario1!=2){
            fancyConfirm("¿Esta seguro que desea cerrar su sesion?", function(estado){
                if(estado){
                    fancyAlertWait("Cerrando sesion");
                    marcarSalidaDelSistema('F');                    
                }
            });
        }else{
            marcarSalidaDelSistema('T');
        }
    }catch (err){
        emitirErrorCatch(err, "salirDelSistema")
    }
}

/* @marcarSalidaDelSistema: Registra la hora del salida del usuario, solo si este no es un USUARIO SUPERVISOR
    PARAMETROS:
        - esUsuarioTSIGO: T= es usuario supervisor; F = no lo es
*/
function marcarSalidaDelSistema(esUsuarioTSIGO){ 
    try{
        var parametros="&idUsuario="+idUsuario+
            "&tipo=S"+
            "&esUsuarioTSIGO="+esUsuarioTSIGO+
            "&cerrarSesion=s";
            consultarWebServiceGet("insertarAsistencia", parametros, function(data){
                if(perfilUsuario1=='2' || data.length>0){
                    activarAdvertencia(false)
                    location.href="signout"; // cierra cesion
                }else{
                    fancyAlert("Lo sentimos no se ha podido cerrar correctamente su sesion, por favor comuniquese con el soporte técnico");        
                }
            }, "Cerrando sesion");
    }catch (err){
        emitirErrorCatch(err, "marcarSalidaDelSistema")
    }   
}