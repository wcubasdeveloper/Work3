var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var idRegistro = $_GET('id');
var modulo = "Articulos_almacen";
var idAlmacen = parent.$("#idAlmacen").val();
cargarInicio(function(){
	$("#btnGuardar").click(guardar);
	DAO.consultarWebServiceGet("getListaAlmacen", "", function(data){
		agregarOpcionesToCombo("idAlmacen", data, {"keyId":"idAlmacen", "keyValue":"nombre"});
		$("#idAlmacen").find("option").eq(0).remove();
		var parametros = "&idAlmacen="+idAlmacen+"&idRegistro="+idRegistro;
		DAO.consultarWebServiceGet("getArticulosPorAgregarAalmacen", parametros, function(data2){
			agregarOpcionesToCombo("idArticulo", data2, {"keyId":"idArticulo", "keyValue":"nombre"});
			if(parseFloat(idRegistro)>0){
				$("#idID").val(idRegistro);
				cargarInfoAbstracto(DAO, modulo, idRegistro, function(data){
					if(data.length>0){
						$("#idArticulo").val(data[0].idArticulo);
						$("#idAlmacen").val(data[0].idAlmacen);
						$("#idAlmacen").prop("disabled", true)
						$.fancybox.close();						
					}else{
						fancyAlert("¡ ERROR, no se encontro información del registro !");
					}
				});
			}else{
				$("#idAlmacen").val(idAlmacen);
				$("#idAlmacen").prop("disabled", true)
				$("#idID").css("display", "none");
				$("#wb_lblID").css("display", "none");
				$.fancybox.close();
			}
		})
	});
});
function guardar(){
	try{
		if(validarCamposRequeridos("idForm")){
			// obtiene datos del formulario
			fancyConfirm("¿Desea proceder con la operación?", function(rpta){
				if(rpta){
					var parametros = "&idArticulo="+$("#idArticulo").val()+
					"&idAlmacen="+$("#idAlmacen").val()+
					"&idArticulos_almacen="+idRegistro;
					
					DAO.consultarWebServiceGet("guardarArticulosXalmacen", parametros, function(data){
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
		emitirErrorCatch(err, "guardar")
	}
}