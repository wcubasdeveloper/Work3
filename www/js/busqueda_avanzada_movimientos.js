var arrayOpcionesBusqueda = parent.arrayOpcionesBusqueda;
var opcionesBusqueda = parent.opcionesBusqueda;
cargarInicio(function(){
	//setMandatoryFields();
	cargarOpcionesBusqueda()
	$("#btnBuscar").click(buscar)
});
function setMandatoryFields(){
	try{
		for(var i=0; i<opcionesBusqueda.length; i++){				
			var opcion = opcionesBusqueda[i].nombreVariable;
			var mensajeText = opcionesBusqueda[i].nombreTexto;
			$("#"+opcion).attr("requerido", mensajeText);
		}			
	}catch(err){
		emitirErrorCatch(err, "setMandatoryFields")
	}
}
function cargarOpcionesBusqueda(){
	try{
		for(var i=0; i<opcionesBusqueda.length; i++){				
			var opcion = opcionesBusqueda[i].nombreVariable;
			if(arrayOpcionesBusqueda[opcion]!=undefined && arrayOpcionesBusqueda[opcion]!=""){
				$("#"+opcion).val(arrayOpcionesBusqueda[opcion]);
			}
		}	
	}catch(err){
		emitirErrorCatch(err, "cargarOpcionesBusqueda")
	}
}
function buscar(){
	try{
		var tieneAlmenosUnValorBusqueda = false;
		var opcionesDeBusqueda = {};
		for(var i=0; i<opcionesBusqueda.length; i++){
			var opcion = opcionesBusqueda[i].nombreVariable;
			opcionesDeBusqueda[opcion] = $("#"+opcion).val();
			if(!tieneAlmenosUnValorBusqueda){
				if($("#"+opcion).val()!=""){
					tieneAlmenosUnValorBusqueda = true;
				}
			}
		}
		if(tieneAlmenosUnValorBusqueda){
			realizoTarea = true;
			rptaCallback = opcionesDeBusqueda;
			parent.$.fancybox.close();
		}else{
			fancyAlert("¡Debe ingresar al menos un criterio de busqueda!")
		}
					
	}catch(err){
		emitirErrorCatch(err, "buscar");
	}
}