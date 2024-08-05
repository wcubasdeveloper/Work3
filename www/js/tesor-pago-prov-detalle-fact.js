/**
 * Created by JEAN PIERRE on 8/01/2018.
 */
var tiposDocumentos = parent.tiposDocumentos
var accion = $_GET("accion");
var idDetalle = $_GET("idDetalle"); //Numerador de items de Detalle
var realizoCambio=false
cargarInicio(function(){
    var nombreProveedor = parent.$("#idProveedor option:selected").text()
    $("#labelProveedor").val(nombreProveedor)
    var campos =  {"keyId":'idTipoDocumento', "keyValue":'descripcion'}
    agregarOpcionesToCombo("idTipoDocumento", tiposDocumentos, campos);
    // agrega campos fecha:
    $("#txtFechaEmision").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#txtFechaEmision").val(convertirAfechaString(new Date(), false));
    $("#txtFechaRecepcion").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#txtFechaRecepcion").val(convertirAfechaString(new Date(), false));
    $("#btnGuardar").click(guardarFactura)
	if(accion=='N'){
        // Nueva factura
    }else{ // Editar factura
			var arrayDetalles = parent.arrayDatosFac;
            for(var i=0; i<arrayDetalles.length; i++){
                if(arrayDetalles[i].idDetalle == idDetalle){
                    //estadoRegistro=arrayDetalles[i].estado;
                    $("#idTipoDocumento").val(arrayDetalles[i].idTipoDoc)
					$("#idEtapa").val(arrayDetalles[i].idEtapa)
					$("#txtFechaEmision").val(arrayDetalles[i].fechaEmision)
					$("#txtObservaciones").val(arrayDetalles[i].observaciones)
					$("#txtFechaRecepcion").val(arrayDetalles[i].fechaRecepcion)
					$("#txtMonto").val(arrayDetalles[i].monto)
					$("#txtNroDoc").val(arrayDetalles[i].nroDocumento)
                    break;
                }
            }
	}
	
	// asigna campos requeridos:
	$("#idTipoDocumento").attr("requerido", "Tipo Documento")
	$("#txtFechaEmision").attr("requerido", "Fecha Emision")
	$("#txtFechaRecepcion").attr("requerido", "Fecha Recepcion")
	$("#txtNroDoc").attr("requerido", "Nro Documento")
	$("#txtMonto").attr("requerido", "Monto")
})
function guardarFactura(){
    try{
        if(validarCamposRequeridos("idForm")){
            //fancyConfirm("¿Esta seguro de guardar la factura?", function(rpta){
                //if(rpta){
					
					// verifica que el nro de documento no se repita:
					var arrayDetalles = parent.arrayDatosFac;
					for(var i=0; i<arrayDetalles.length; i++){
						if(arrayDetalles[i].idDetalle!=idDetalle){
							if(arrayDetalles[i].nroDocumento == $("#txtNroDoc").val()){
								fancyAlert("¡Ya existe una factura con el mismo numero de documento ("+$("#txtNroDoc").val()+")!")
								return
							}
						}
					}
					
                    var registro = {
                        idDetalle : idDetalle,
                        idTipoDoc: $("#idTipoDocumento").val(),						
                        tipoDocumento:$("#idTipoDocumento option:selected").text(),
						idEtapa:$("#idEtapa").val(),
						nombreEtapa:$("#idEtapa option:selected").text(),
                        fechaEmision:$("#txtFechaEmision").val(),
                        observaciones:$("#txtObservaciones").val(),
                        fechaRecepcion:$("#txtFechaRecepcion").val(),
                        monto:parseFloat($("#txtMonto").val()),
                        nroDocumento:$("#txtNroDoc").val()
                    };
                    if(accion=='N'){
                        registro.idFactura = 0
                    }

                    realizoTarea=true;      //devuelve dato en variable global (:MHBSoftScripts.js
                    rptaCallback = [registro];
                    parent.$.fancybox.close()
                //}
            //})
        }
    }catch(err){
        emitirErrorCatch(err, "guardarFactura")
    }
}