var realizoTarea=false;
var rptaCallback;
// ******* Informacion del expediente ingresado ********
/*var idExpedienteRegistrado=parent.idExpedienteRegistrado;
var idUsuarioRemitente=parent.usuarioIdentificado;
var idAreaRemitente=parent.idAreaDelUsuario; // area del usuario remitente
var fechaIngreso = dateTimeFormat(parent.$("#idFechaExpediente").val())+" "+parent.$("#idHoraExpediente").val();*/
//Obtiene variables enviadas x metodo GET EN LA URL
var idHistorial = getUrlVars()["idHistorial"];
var idExpedienteRegistrado=getUrlVars()["idExpediente"];
var idUsuarioRemitente=getUrlVars()["idUsuario"];
var idAreaRemitente=getUrlVars()["idArea"];
var fechaIngreso=getUrlVars()["fechaExpediente"];
//*****************************************************
var usuarios; // En esta variable se guarda la cantidad de usuarios disponibles
cargarInicio(function(){
	cargarEstadosExpediente()
	var estadoExpediente=getUrlVars()["estadoExpediente"]; // obtiene el estado actual del expediente
	$("#idEstado").val(estadoExpediente); // carga el estado del expediente en el combobox	
	var activarComboEstado = getUrlVars()["activar"];
	if(activarComboEstado=='T'){ // Activar combo estado si el valor es 'T'
		$("#idEstado").attr("disabled", false); // habilita combobox
	}
	buscarAreas();
})
function cargarEstadosExpediente(){
	try{
		var estados = []
		estados.push({"id":"0", "descripcion":"Nuevo"})
		estados.push({"id":"1", "descripcion":"En Proceso"})
		estados.push({"id":"2", "descripcion":"Observado"})
		estados.push({"id":"3", "descripcion":"Aprobado"})
		agregarOpcionesToCombo("idEstado", estados, {keyValue:"descripcion", keyId:"id"});		
	}catch(err){
		emitirErrorCatch(err, "cargarEstadosExpediente")
	}
}
/* @buscarAreas: Obtiene y lista las áreas registradas.
*/
function buscarAreas(){
	try{
		consultarWebServiceGet("getAllAreas", "", function(data){ 
			listarAreas(data);
			buscarUsuarios();
		})
		$("#idComboArea").change(cargarUsuariosXarea);
		$("#idBtnGuardar").click(guardarDerivacion);
	}catch(err){
		emitirErrorCatch(err, "buscarAreas")
	}
}
function listarAreas(data){
	try{
		for(var i=0; i<data.length; i++){
			$("#idComboArea").append(new Option(data[i].Nombre, data[i].idArea))
		}
	}catch(err){
		emitirErrorCatch(err, "listarAreas")	
	}
}

/* @buscarUsuarios: Obtiene y guarda en un arreglo los usuarios del sistema
*/
function buscarUsuarios(){
	try{
		var parametros="&idUsuario="+idUsuarioRemitente; 
		consultarWebServiceGet("getAllUsuarios", parametros, function(data){ // Busca a todos los usuarios menos al que se ha identificado 
			usuarios=data; // Guarda la cantidad de usuarios
			$.fancybox.close(); // cierra mensaje de espera
		})
	}catch(err){
		emitirErrorCatch(err, "buscarUsuarios")
	}
}
function cargarUsuariosXarea(){
	try{
		var opcionSeleccionada=$("#idComboArea").val();
		$("#idComboUsuario").html("<option value=''>Seleccione</option>");
		if(opcionSeleccionada!=""){
			for(var i=0; i<usuarios.length; i++){
				if(usuarios[i].idArea==opcionSeleccionada){
					$("#idComboUsuario").append(new Option(usuarios[i].nombreUsuario, usuarios[i].idUsuario))
				}
			}
		}else{
			fancyAlertFunction("¡¡ Debe seleccionar una área !!", function(estado){
				if(estado){
					$("#idComboArea").focus();	
				}
			})
		}
	}catch(err){
		emitirErrorCatch(err, "cargarUsuariosXarea")
	}
}

/* @guardarDerivacion: Registra la derivación del expediente al área destino seleccionado.
*/
function guardarDerivacion(){
	try{
		if(validarCamposRequeridos("idPanelTramite")){
			var txtAdicional="";
			if($("#idEstado").val()!='1' && $("#idEstado").val()!='0'){ // Si ya no esta en proceso
				var estadoNombre=$("#idEstado option:selected").text();
				txtAdicional="¡¡Si cambia el estado del expediente a '"+estadoNombre+"', ya no se podra modificar el expediente con sus informes, ni derivarse a ninguna otra area!!<br><br>";
			}
			fancyConfirm(txtAdicional+"¿ Esta seguro de proceder a derivar el tramite ?", function(estado){
				if(estado){
					var parametros="&idAreaDestino="+$("#idComboArea").val()+
					"&idUsuarioDestino="+$("#idComboUsuario").val()+
					"&comentario="+$("#idComentario").val()+
					"&idExpediente="+idExpedienteRegistrado+
					"&idUsuarioRemitente="+idUsuarioRemitente+
					"&idAreaRemitente="+idAreaRemitente+
					"&fechaIngreso="+fechaIngreso+
					"&estado="+$("#idEstado").val()+
					"&idHistorial="+idHistorial;
					consultarWebServiceGet("guardarDerivacion", parametros, function(data){
						//var idHistorial=data[0];
						var cantidadAfectada=data[0];
						if(cantidadAfectada>0){ // se inserto
							var mensaje="";
							if(idHistorial=="0"){
								mensaje="¡Se registro el expediente correctamente!";
							}else{
								mensaje="¡El documento fue movido correctamente!";
							}							
							fancyAlertFunction(mensaje, function(data){						
								if(idHistorial!="0"){
									parent.buscarTramites();								
								}else{
									realizoTarea=true;
									rptaCallback=[{registrado:cantidadAfectada}];
								}
								parent.$.fancybox.close(); // cierra la ventana	
							})
						}else{
							fancyAlert("No se pudo derivar")
						}
					})
				}
			})
		}
	}catch(err){
		emitirErrorCatch(err, "guardarDerivacion")
	}
}