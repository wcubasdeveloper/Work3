var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var idRegistro = $_GET('id');
var modulo = "Uso_Vehiculo";
cargarInicio(function(){
	$("#btnGuardar").click(guardar);
	if(parseFloat(idRegistro)>0){
		$("#idID").val(idRegistro);
		cargarInfoAbstracto(DAO, modulo, idRegistro, function(data){
			if(data.length>0){
				$("#idDescripcion").val(data[0].nombreUso);
				$.fancybox.close();
				$("#idDescripcion").focus();
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
					var parametros = "&descripcion="+$("#idDescripcion").val()+
					"&idUso="+idRegistro;					
					DAO.consultarWebServiceGet("guardarUso_Vehiculo", parametros, function(data){
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