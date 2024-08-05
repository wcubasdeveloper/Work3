$(document).ready(function(){
	cargarGeneracionTXT(); // Metodo para abrirLogin
});
function cargarGeneracionTXT(){
    try{
    	fancyAlertWait("Cargando");
        var fechaActual=new Date();
        var añoActual = fechaActual.getFullYear();
        var inicio = añoActual -3;
        var fin = añoActual -1;
        for(inicio; inicio<=fin; inicio++){
            $("#idAño").append(new Option(inicio,inicio));
        }
        $.fancybox.close();
    }catch (err){
        var txt = "Se encontro un error en la funcion cargarGeneracionTXT\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}
function generarTXT(){
    try{
        var inputsAvalidar="idAño-Año"; /// (id del input '-' nombre a mostrar)
        if(validarInputsValueXid(inputsAvalidar)){
            fancyAlertWait("Generando TXT. Esto puede tomar algunos minutos");
            var parametros="&año="+$("#idAño").val();
            webService( "generarTXT", parametros, "finGenerarTXT()" );
        }
    }catch (err){
        var txt = "Se encontro un error en la funcion generarTXT\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}
function finGenerarTXT(){
    try{
        if(rptaWebservice[0]=="T"){
            fancyAlert(mensajeExitoGeneracionTXT);
        }else{
            fancyAlert(mensajeFalloGeneracionTXT);
        }

    }catch (err){
        var txt = "Se encontro un error en la funcion finGenerarTXT\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}