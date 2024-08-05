var realizoTarea=false;
var rptaCallback;
var idArea=0;
cargarInicio(function(){
	idArea=parseInt(getUrlVars()["idArea"]);
	$("#idGuardar").click(function(){
		Guardar();
	});
	if(idArea>0){
		labelTextWebPlus("id_Titulo","EDITAR AREA")// cambia de titulo
		var nombre = getUrlVars()["nombre"];
		$("#idBtnPlantilla").css("display", "block");
		$("#idBtnPlantilla").click(function(){
			editarPlantillaArea(idArea, nombre, 'F');
		})		
		$("#idNombre").val(nombre);		
	}
});
function editarPlantillaArea(idArea, nombreArea, esNuevo){
	try{
		var parametros="?tipo=Plantilla"+
			"&nombreArea="+nombreArea+
			"&idArea="+idArea+
			"&esNuevo="+esNuevo;
		parent.abrirVentanaFancyBox(700, 400, "mantenimiento_informe"+parametros, true, parent.buscarAreas);
	}catch(err){
		emitirErrorCatch(err, "editarPlantillaArea")
	}
}
function Guardar(){
	try{
		if(validarCamposRequeridos("idComponents")){
			var parametros="&idArea="+idArea+
				"&nombre="+$("#idNombre").val();
			consultarWebServiceGet("guardarArea", parametros, function(data){ // Actualiza o inserta una area.
				if(data[0]>0){
					var idAreaInsertada = data[0];
					realizoTarea=true;
					var mensaje="";
					if(idArea==0){
						mensaje="Se inserto nueva Area ("+idAreaInsertada+")";
					}else{
						mensaje="Se actualizo Area id : "+idArea;
					}
					fancyAlertFunction(mensaje, function(estado){
                        if(estado){
                        	if(idArea==0){ // se inserto una nueva area, procede a editar la plantilla
                        		editarPlantillaArea(idAreaInsertada, $("#idNombre").val(), 'T');
                        	}else{
                        		parent.$.fancybox.close(); // cierra
                        	}                            
                        }
                    }); 
				}
			})
		}
	}catch(err){
		emitirErrorCatch(err, "Guardar");
	}
} 