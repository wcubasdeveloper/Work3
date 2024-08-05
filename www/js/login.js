var realizoTarea=false;
var rptaCallback;
$(document).ready(function(){
	// asignamos eventos a inputs
    $("#txtUName").focus();
});
function validarLogin(){ // Esta función se ejecuta en login, se identifica al usuario de la escuela o promotor
    try{
        parent.claveEcr="";
        parent.idUsuarioXclave=0;
        var inputsAvalidar="txtUName-Usuario/txtClave-Clave"; /// (id del input '-' nombre a mostrar)
        if(validarInputsValueXid(inputsAvalidar)) { //Verifica que los campos de usuario y contraseña estén llenos
            var parametros="&clave="+$("#txtClave").val()+
                "&usuario="+$("#txtUName").val();  
            consultarWebServiceGet('validarLogin', parametros, function(data){
                if(data[0]!=null){
                    if(data[0]=='S' || data[0]=='ON' || data[0]=='NEW'){ // identifica si hay estado de cierre de periodo o la cuenta del usuario estaba abierta en otra pc
                        switch(data[0]){
                            case 'S': // La empresa se encuentra en cierre de periodo
                                fancyAlert("AUTOSEGURO se encuentra en Proceso de cierre de periodo");
                                return;
                                break;
                            case 'ON': // cuenta del usuario abierta en otra pc
                                fancyAlert("Su sesion actualmente se encuentra abierta. Por favor cierrela y vuelva a intentarlo !!");
                                return;
                                break;
                            case 'NEW': // Se ha expirado la clave de la cuenta motivo por el cual se debe cambiar la contraseña
                                //parent.claveEcr=data[2];
                                //parent.idUsuarioXclave=data[1];
                                fancyAlertFunction("La vigencia de su clave ha expirado, debe cambiar su clave !!", function(estado){
                                    if(estado){
                                        var parametros="?idUsuarioXclave="+data[1]+
                                            "&claveEcr="+data[2];
                                        parent.abrirVentanaFancyBox(400,250,"cambiarclave"+parametros,false);
                                    }
                                });
                                return;
                                break;
                        }
                    }else{
                        realizoTarea=true;
                        rptaCallback=data;
                        parent.$.fancybox.close(); // Cierra la ventana de login y espera que se cargue la funcion callback que abrio el fancybox
                    }
                }else{
                    $("#txtUName").blur(); // quita focus()
                    $("#txtClave").blur();
                    fancyAlertFunction("Usuario Invalido", function(estado){
                        if(estado){
                            $("#txtUName").focus();
                        }
                    });            
                }                
            }, "Validando Usuario" ); // valida login y ejecuta la función "cargarInformacionDelSistema()"          
        }    
    }catch(err){
        emitirErrorCatch(err, "validarLogin")
    }
}
/*function cargarInformacionDelSistema(data){
    try{
        if(data[0]!=null){
            if(data[0]=='S' || data[0]=='ON' || data[0]=='NEW'){ // identifica si hay estado de cierre de periodo o la cuenta del usuario estaba abierta en otra pc
                switch(data[0]){
                    case 'S': // La empresa se encuentra en cierre de periodo
                        fancyAlert("AUTOSEGURO se encuentra en Proceso de cierre de periodo");
                        return;
                        break;
                    case 'ON': // cuenta del usuario abierta en otra pc
                        fancyAlert("Su sesion actualmente se encuentra abierta. Por favor cierrela y vuelva a intentarlo !!");
                        return;
                        break;
                    case 'NEW': // Se ha expirado la clave de la cuenta motivo por el cual se debe cambiar la contraseña
                        parent.claveEcr=data[2];
                        parent.idUsuarioXclave=data[1];
                        fancyAlertFunction("La vigencia de su clave ha expirado, debe cambiar su clave !!", function(estado){
                            if(estado){
                                parent.abrirFancyBox(400,250,"cambiarclave");
                            }
                        });
                        return;
                        break;
                }
            }else{
                //ASIGNA VARIABLES GLOBALES DEL SISTEMA
                parent.idUsuario=data[0].idUsuario;
                parent.idArea=data[0].idArea;
                parent.nombreArea=data[0].nombreArea;
                parent.perfilUsuario1=data[0].idPerfil1;
                parent.perfilUsuario2=data[0].idPerfil2;
                parent.perfilUsuario3=data[0].idPerfil3;
                parent.nombreUsuario = data[0].Nombres+", "+data[0].Apellidos;
                parent.idLocal = data[0].idLocal;                
                parent.localRemoto=data[0].localRemoto;
                // consulta por los datos del periodo actual
                consultarWebServiceGet("getPeriodoActual", "", function(datosPeriodo){
                    parent.idPeriodo = datosPeriodo[0].idPeriodo;
                    parent.codPeriodo = agregarCEROaLaIzquierda(datosPeriodo[0].codPeriodo);
                    parent.fechaInicioPeriodo=fechaFormateada(datosPeriodo[0].inicio, false, false);
                    //***********************************
                    fancyAlertWait("Bienvenido "+parent.nombreUsuario);
                    // CARGA LA CABECERA HTML DEL SISTEMA CON LOS DATOS DE LA EMPRESA
                    parent.labelTextWebPlus("datosUsuario", parent.nombreUsuario); // nombre de usuario
                    parent.labelTextWebPlus("fechaSistema",fechaFormateada(new Date(), true, true)) //captura y muestra la fecha y hora de ingreso al sistema
                    parent.labelTextWebPlus("idLocal", data[0].nombreLocal)// muestra nombre del local
                    parent.labelTextWebPlus("idDireccion", data[0].direccion)// muestra la direccion del local
                    parent.labelTextWebPlus("idCodPeriodo", "PERIODO "+parent.codPeriodo)// muestra el codigo del periodo
                    parent.labelTextWebPlus("idFechaInicio","Inicio : "+parent.fechaInicioPeriodo)// muestra la fecha de inicio del periodo
                    parent.$("#logoEscuela").attr("src","images/logo.png"); // carga el logo de Autoseguros                
                    ingresarAsistencia();
                }, false)
            }
        }else{
            $("#txtUName").blur(); // quita focus()
            $("#txtClave").blur();
            fancyAlertFunction("Usuario Invalido", function(estado){
                if(estado){
                    $("#txtUName").focus();
                }
            });            
        }
    }catch (err){
        var txt = "Se encontro un error en la funcion cargarInformacionDelSistema.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        fancyAlert(txt);
    }
}*/
/*function ingresarAsistencia(){
    try{
        var esUsuarioTSIGO="F"; // false
        if(parent.perfilUsuario1=='2' || parent.perfilUsuario2=='2' || parent.perfilUsuario3=='2'){ // 2 = usuario TSIGO; Identifica si el usuario es TSIGO
            esUsuarioTSIGO="T"; // True; es usuario TSIGO
        }
        var parametros="&idUsuario="+parent.idUsuario+
            "&tipo=E"+
            "&esUsuarioTSIGO="+esUsuarioTSIGO;
        consultarWebServiceGet("insertarAsistencia", parametros, consultarMenu);
    }catch (err){
        var txt = "Se encontro un error en la funcion ingresarAsistencia.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        fancyAlert(txt);
    }
}
function consultarMenu(){
    try{
        cargarListaDeUsuariosConectados(true);
        parent.declararTimer();
        var usuarioMaster=false;
        if(parent.perfilUsuario1==1 || parent.perfilUsuario1==2){ // Busca si es un usuario MASTER (TSIGO o ADMIN)
            usuarioMaster=true;
        }
        if(usuarioMaster==true){
            cargarMenu(parent.arrayOpciones)
        }else{
            var parametros="";
                parametros +="&idPerfil1="+parent.perfilUsuario1;
                parametros +="&idPerfil2="+parent.perfilUsuario2;
                parametros +="&idPerfil3="+parent.perfilUsuario3;
            consultarWebServiceGet("getOpcionesMenu", parametros, cargarMenu); // getOpcionesMenu => Buscara todas las opciones permitidas al usuario y despues enviara dicha informacion a la funcion cargarMenu()
        }
    }catch (err){
        var txt = "Se encontro un error en la funcion  consultarMenu.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        fancyAlert(txt);
    }
}*/
