var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var idRegistro = $_GET('id');
var modulo = "Local";
cargarInicio(function(){
	$("#btnGuardar").click(guardar);
	if(parseFloat(idRegistro)>0){
		$("#idID").val(idRegistro);
		cargarInfoAbstracto(DAO, modulo, idRegistro, function(data){
			if(data.length>0){
				$("#idNombre").val(data[0].nombre);
				$("#idRUC").val(data[0].RUC);
				$("#idDireccion").val(data[0].direccion);
				$("#idTelefono").val(data[0].telefono);
				$("#idCelular").val(data[0].celular);
				$("#idCorreo").val(data[0].correo);
				$("#idEstado").val(data[0].estado);
				$("#idRemoto").val(data[0].localRemoto);
				$("#idNombresContacto").val(data[0].nombres_contacto);
				$("#idApellidosContacto").val(data[0].apellidos_contacto);
				$.fancybox.close();
				$("#idNombre").focus();
			}else{
				fancyAlert("¡ ERROR, no se encontro información del registro !");
			}
		});
	}else{
		$("#idID").css("display", "none");
		$("#wb_lblID").css("display", "none");
		$.fancybox.close();
		$("#idNombre").focus();
	}	
});
function guardar(){
	try{
		if(validarCamposRequeridos("idForm")){
			// obtiene datos del formulario
			fancyConfirm("¿Desea proceder con la operación?", function(rpta){
				if(rpta){
					var parametros = "&nombre="+$("#idNombre").val()+
					"&RUC="+$("#idRUC").val()+
					"&direccion="+$("#idDireccion").val()+
					"&telefono="+$("#idTelefono").val()+
					"&celular="+$("#idCelular").val()+
					"&correo="+$("#idCorreo").val()+
					"&estado="+$("#idEstado").val()+
					"&remoto="+$("#idRemoto").val()+
					"&nombreContacto="+$("#idNombresContacto").val()+
					"&apellidoContacto="+$("#idApellidosContacto").val()+
					"&idLocal="+idRegistro;
					
					DAO.consultarWebServiceGet("guardarLocal", parametros, function(data){
						if(data[0]>0){
							realizoTarea = true;
							var mensaje = "¡Se Registró la información correctamente!";
							if(parseFloat(idRegistro)>0){
								mensaje = "¡Se actualizarón los cambios correctamente!"
							}
							fancyAlertFunction(mensaje, function(){
								parent.$.fancybox.close();
							})
						}else{
							fancyAlert("¡Operación Fallida!")
						}
					});
					
				}
			});			
		}		
	}catch(err){
		emitirErrorCatch(err);
	}
}