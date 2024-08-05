var realizoTarea=false;
var rptaCallback;
var idUsuario=0; 
cargarInicio(function(){
    // Busca los locales disponibles
    consultarWebServiceGet("getLocales", "", function(data){
        cargarLocales(data); // lista los locales
        consultarWebServiceGet("getPerfiles", "", function(datos){ // consulta por todos los perfiles
            cargarPerfiles(datos);
            // Despues de haber cargado los locales y los Pefiles, cargará las areas disponibles
            consultarWebServiceGet("getAllAreas", "", function(info){
                cargarAreas(info);
                // Se terminaron de cargar todos los combobox (Locales, Perfiles, Areas), se identifica el idUsuario. Si es 0=Nuevo Usuario / mayor de 0 =Editar Usuario
                idUsuario=parseInt(getUrlVars()["idUsuario"]);
                if(idUsuario>0){ // Se actualizará la informacion de un Usuario
                    // Carga info del Usuario
                    labelTextWebPlus("idTitulo", "EDITAR USUARIO"); // CAMBIA EL TITULO DE LA VENTANA
                    // Obtiene parametros GET RESTANTES
                    var nombres = getUrlVars()["nombres"];
                    var apellidos = getUrlVars()["apellidos"];
                    var DNI = getUrlVars()["DNI"];
                    var user = getUrlVars()["user"];
                    var pasx = getUrlVars()["pasx"];
                    var perfil1 = getUrlVars()["perfil1"];
                    if(perfil1=="0"){
                        perfil1="";
                    }
                    var perfil2 = getUrlVars()["perfil2"];
                    if(perfil2=="0"){
                        perfil2="";
                    }
                    var perfil3 = getUrlVars()["perfil3"];
                    if(perfil3=="0"){
                        perfil3="";
                    }
                    var area = getUrlVars()["area"];
                    var idLocal = getUrlVars()["idLocal"];
                    // Carga info en componentes
                    $("#idNombres").val(nombres);
                    $("#idApellidos").val(apellidos);
                    $("#idDNI").val(DNI);
                    $("#idLocal").val(idLocal);
                    $("#idUsuario").val(user);
                    $("#idClave").val(pasx);
                    $("#idPerfil").val(perfil1);
                    $("#idPerfil2").val(perfil2);
                    $("#idPerfil3").val(perfil3);
                    validarPerfil("1");
                    validarPerfil("2");
                    validarPerfil("3");
                    $("#idArea").val(area);
                }
                $.fancybox.close();
            })            
        });    
    });
})
function cargarLocales(data){
    try{
        for(var i=0; i<data.length; i++){
            $("#idLocal").append(new Option(data[i].Nombre, data[i].idLocal));
        }
    }catch (err){
        emitirErrorCatch(err, "cargarLocales")
    }
}
function cargarPerfiles(data){
    try{
        for(var i=0; i<data.length;i++){
            $("#idPerfil").append(new Option(data[i].nombrePerfil, data[i].idPerfil));
            if(data[i].idPerfil!=1 && data[i].idPerfil!=2){
                $("#idPerfil2").append(new Option(data[i].nombrePerfil, data[i].idPerfil));
                $("#idPerfil3").append(new Option(data[i].nombrePerfil, data[i].idPerfil));
            }
        }
    }catch (err){
        emitirErrorCatch(err, "cargarPerfiles")
    }
}
function cargarAreas(data){
    try{
        for(var i=0; i<data.length; i++){
            $("#idArea").append(new Option(data[i].Nombre, data[i].idArea));
        }
    }catch(err){
        emitirErrorCatch(err, "cargarAreas")
    }
}
function guardarUsuario(){// Actualiza o registra un usuario
    try{
        var valuesXvalidar="idNombres-Nombres/idApellidos-Apellidos/idDNI-DNI/idLocal-Local/idUsuario-Usuario/idClave-Clave/idPerfil-Tipo Usuario/idArea-Area";
        if(validarInputsValueXid(valuesXvalidar)){
            fancyConfirm(TEXT_GuardarUsuario, function(estado){
                if(estado){                  
                  var parametros="&nombres="+$("#idNombres").val()+
                    "&apellidos="+$("#idApellidos").val()+
                    "&DNI="+$("#idDNI").val()+
                    "&local="+$("#idLocal").val()+
                    "&usuario="+$("#idUsuario").val()+
                    "&clave="+$("#idClave").val()+
                    "&perfil1="+$("#idPerfil").val()+
                    "&perfil2="+$("#idPerfil2").val()+
                    "&perfil3="+$("#idPerfil3").val()+
                    "&idArea="+$("#idArea").val()+
                    "&idUsuario="+idUsuario;
                    consultarWebServiceGet("insertarUsuario", parametros, function(data){
                        if(data[0]>0){
                            realizoTarea=true;
                            var mensaje="";
                            if(idUsuario==0){ // se ingreso un nuevo Usuario
                                mensaje=TEXT_IngresoDeUsuarioEfectivo+"("+data[0]+")";
                                var desc="Ingreso al Usuario con id : "+data[0]; // se registra la acción en la tabla EVENTOSLOG
                                ingresarLog(desc, parent.idUsuarioIdentificado); // guarda log
                            }else{
                                mensaje="Se actualizó la información del Usuario ("+idUsuario+")";
                            }
                            fancyAlertFunction(mensaje, function(estado){
                                if(estado){
                                    //limpiarFormularioDeNuevoUsuario();
                                    parent.$.fancybox.close();
                                }
                            });                
                        }
                    });
                }
            });
        }
    }catch (err){
        emitirErrorCatch(err, "guardarUsuario")
    } 
}
function limpiarFormularioDeNuevoUsuario(){
	try{
		$(":text").val("");
    	$("select").val("");
	} catch (err){
		emitirErrorCatch(err, "limpiarFormularioDeNuevoUsuario")
	}
}
function validarPerfil(idPerfil){ // valida la seleccion de perfil para el nuevo usuario
    try{
        switch(idPerfil){
            case '1':
                valorIdPerfil1=$("#idPerfil").val();
                if(valorIdPerfil1!="" && valorIdPerfil1!="1" && valorIdPerfil1!="2"){
                    $("#idPerfil2").prop("disabled", false); // deshabilita el siguiente select cuando se ha seleccionado un perfil valido diferente de Administrador y Usuario TSIGO
                }else{
                    $("#idPerfil2").val("");
                    $("#idPerfil2").prop("disabled", true);
                    $("#idPerfil3").val("");
                    $("#idPerfil3").prop("disabled", true);
                    if(valorIdPerfil1==""){
                        fancyAlertFunction("Debe selecionar una opcion valida para el primer perfil", function(e){
                            if(e){
                                $("#idPerfil").focus();
                            }
                        });
                    }
                }
                break;
            case '2':
                valorIdPerfil1=$("#idPerfil").val();
                valorIdPerfil2=$("#idPerfil2").val();                
                if(valorIdPerfil2!="" && valorIdPerfil2!=valorIdPerfil1){
                    $("#idPerfil3").prop("disabled", false);
                }else{
                    $("#idPerfil3").val("");
                    $("#idPerfil3").prop("disabled", true);
                    if(valorIdPerfil2==""){
                        mensaje="Debe selecionar una opcion valida para el segundo perfil";                        
                    }else{
                        mensaje="La opción "+$("#idPerfil2 option:selected").text()+" ya se encuentra selecionada en el primer perfil, por favor seleccione una opcion diferente";
                    }
                    fancyAlertFunction(mensaje, function(e){
                        if(e){
                            $("#idPerfil2").val("");
                            $("#idPerfil2").focus();
                        }
                    });
                }
                break;
            case '3':
                valorIdPerfil1=$("#idPerfil").val();
                valorIdPerfil2=$("#idPerfil2").val();
                valorIdPerfil3=$("#idPerfil3").val();
                continua=true;
                if(valorIdPerfil3==""){
                    mensaje="Debe selecionar una opcion valida para el tercer perfil";
                    continua=false;                     
                }
                if(valorIdPerfil3==valorIdPerfil2){
                    mensaje="La opción "+$("#idPerfil3 option:selected").text()+" ya se encuentra selecionada en el segundo perfil,  por favor seleccione una opcion diferente"; 
                    continua=false; 
                }
                if(valorIdPerfil3==valorIdPerfil1){
                    mensaje="La opción "+$("#idPerfil3 option:selected").text()+" ya se encuentra selecionada en el primer perfil,  por favor seleccione una opcion diferente";
                    continua=false; 
                }
                if(!continua){
                    fancyAlertFunction(mensaje, function(e){
                        if(e){
                            $("#idPerfil3").val("");
                            $("#idPerfil3").focus();
                        }
                    });
                }
                break;
        }
    }catch (err){
        emitirErrorCatch(err, "validarPerfil")
    }   
}