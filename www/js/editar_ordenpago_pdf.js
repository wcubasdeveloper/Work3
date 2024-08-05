var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var nroOrden = $_GET("nroOrden")
//var tipoExpediente = $_GET("tipoExpediente")
var imprimirGuardar = $_GET("IG")
var myEditorCuerpo
var contenidoPlantilla
cargarInicio(function(){	
	$("#btnImprimir").click(function(){
		if(myEditorCuerpo.getContent()!=contenidoPlantilla){
			fancyConfirm("¿Desea guardar los cambios previamente a la impresion?", function(rpta){
				if(rpta){
					imprimirGuardar = "true"
					guardar()
				}else{
					imprimir()
				}
			})
		}else{
			imprimir()
		}
	})
	if(imprimirGuardar=='true'){
		$("#btnImprimir").hide()
		$("#btnGuardar").val("Imprimir")
	}
	$("#btnGuardar").click(guardar)
	myEditorCuerpo = new dhtmlXEditor({
		parent: "panelCuerpo",
		toolbar: true, // force dhtmlxToolbar using
		iconsPath: "js_editor/codebase/imgs/", // path for toolbar icons
		skin: "dhx_skyblue",
	});
	var parametros = "&nroOrden="+nroOrden
	DAO.consultarWebServiceGet("getPlantillaOrdenPagoAgraviado", parametros, function(data){
		contenidoPlantilla = data[0].plantillaCuerpoOrdenPago
		var content = data[0].plantillaCuerpoOrdenPago
		if(content==""){
			content = data[0].plantillaDefault
		}
		myEditorCuerpo.setContent(content);	
		$.fancybox.close()
	})	
	
})
function imprimir(){ // imprime pdf
	try{
		var parametros = "&nroOrden="+nroOrden
		window.open("wbs_tesoreria?funcion=imprimirOPA"+parametros,'_blank');
	}catch(err){
		emitirErrorCatch(err, "imprimir")
	}
}
function guardar(){ // guardar plantilla
	try{
		var parametros={
			nroOrden:nroOrden,
			plantilla:myEditorCuerpo.getContent()
		}
		DAO.consultarWebServicePOST(parametros, "actualizarPlantillaOrdenPagoAgraviado", function(data){
			if(data[0]>0){
				contenidoPlantilla = myEditorCuerpo.getContent()
				if(imprimirGuardar=="true"){
					imprimir()
					realizoTarea=true;												
					parent.$.fancybox.close();
				}else{ // cierra la ventana
					fancyAlert("Actualización correcta!")
				}			
			}else{
				fancyAlert("No se pudo actualizar la plantilla!!")
			}		
		})
	}catch(err){
		emitirErrorCatch(err, "imprimir")
	}
}