$(document).ready(function(){	
	try{
		consultarWebServiceGet("getPerfiles", "", function(data){
			cargarPerfiles(data, 'idPerfil', 'B');			
		}); // consulta al webservice por los perfiles y los carga en la tabla por medio de la funcion cargarTablaPerfiles
	}catch(err){
		emitirErrorCatch(err, "funcion ready")
	}
});

function cargaDatosPerfil(){
	try{
		if($("#idPerfil").val()!=""){
			$("#content_Perfil").css("display", "block");
			nombrePerfil=$("#idPerfil option:selected").text();
			$("#nombrePerfil").val(nombrePerfil);
			$("#nombrePerfil").focus();			
		}else{
			fancyAlertFunction("Seleccione un perfil valido", function(estado){
				if(estado){
					$("#content_Perfil").css("display", "none");
				}
			});
		}
	}catch (err){
		emitirErrorCatch(err, "cargaDatosPerfil")
	}	
}
function validaNuevoNombre(){
	try{
		if($("#nombrePerfil").val().toLowerCase()!=$("#idPerfil option:selected").text().toLowerCase()){
			$("#idGuardar").prop("disabled", false); // habilita boton de guardar
		}else{
			$("#idGuardar").prop("disabled", true);
		}

	}catch (err){
		emitirErrorCatch(err, "validaNuevoNombre")
	}	
}
function actualizarNombrePerfil(){
	try{
		var inputsAvalidar="nombrePerfil-Nombre de Perfil";
		if(validarInputsValueXid(inputsAvalidar)){
			fancyConfirm("Estas seguro de actulizar el nombre del perfil", function (estado){
				if(estado){
					var parametros="&idPerfil="+$("#idPerfil").val()+
								   "&nombrePerfil="+$("#nombrePerfil").val();
					consultarWebServiceGet("actualizarPerfil", parametros, function(data){
						if(data.length>0){
							$("#idPerfil option:selected").text($("#nombrePerfil").val());
							$("#idGuardar").prop("disabled", true);
							$.fancybox.close();
						}else{
							fancyAlert("No se pudo actualizar");
						}
					})
				}
			});
		}
	}catch (err){
		emitirErrorCatch(err, "actualizarNombrePerfil")
	}	
}
function configurarMenuXperfil(){
	try{
		abrirVentanaFancyBox(820, 450, "menuxperfil", true);
	}catch (err){
		emitirErrorCatch(err, "configurarMenuXperfil")
	}	
}
function crearNuevoPerfil(){
	try{
		abrirVentanaFancyBox(400,200, "nuevoperfil", true);
	}catch (err){
		emitirErrorCatch(err, "crearNuevoPerfil")
	}	
}