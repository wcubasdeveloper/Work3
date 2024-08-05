function actualizarClave(){
    try{
        // primero verificar que las contraseñas sean iguales, luego verificar que la nueva contraseña sea diferente a la anterior(guardada en la BD)
        var validaCampos="nuevaClave-Nueva Clave/confirmaClave-Confirmar Clave";
        if(validarInputsValueXid(validaCampos)){
            // obtiene parametros GET
            var claveEcr=getUrlVars()["claveEcr"]; // Clave encriptada
            var idUsuarioXclave=getUrlVars()["idUsuarioXclave"];
            if($("#nuevaClave").val()!=$("#confirmaClave").val()){
                fancyAlert("La confirmación de la clave es incorrecta, por favor corrigela");
            }else{
                if($("#nuevaClave").val()==claveEcr){
                    fancyAlert("Su nueva clave debe ser diferente");
                }else{
                    // envia para registrar la nueva clave
                    var parametros = "&nuevaClave="+$("#nuevaClave").val()+
                                     "&idUsuario="+idUsuarioXclave;
                    consultarWebServiceGet("cambiarClaveExpirada", parametros, function(data){
                        if(data.length>0){ // Si se llego a cambiar la clave
                            fancyAlertFunction("Se cambio su clave correctamentes, vuelva a identificarse", function(estado){
                                if(estado){
                                    parent.abrirLogin(); // abre login
                                }
                            });                
                        }
                    });
                }
            }
        }
    }catch (err){
        emitirErrorCatch(err, "actualizarClave")
    }
}