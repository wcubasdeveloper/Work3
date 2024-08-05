var realizoTarea=true;
var rptaCallback=undefined;
var provinciaSeleccionada=parent.idProvinciaSelect;
var arrayProvincias=parent.arrayProvincias;
var arrayDepartamentos=parent.arrayDepartamentos;
cargarInicio(
	function(){
		listarDepartamentos(arrayDepartamentos, "r");
		cargarEventoComboDepa("r", arrayProvincias);		
		$("#idProvincia_r").select2();
		if(provinciaSeleccionada!=""){// Provincia seleccionada anteriormente, se busca su departamento
			for(var i=0; i<arrayProvincias.length; i++){
				if(arrayProvincias[i].idProvincia==provinciaSeleccionada){
					var idDepaSeleccionado=arrayProvincias[i].idDepartamento;
					$("#idDepartamento_r").val(idDepaSeleccionado);
					$("#idDepartamento_r").select2();
					cargarListaProvincias("r", arrayProvincias, idDepaSeleccionado);
					$("#idProvincia_r").val(provinciaSeleccionada);
					$("#idProvincia_r").select2();
					break;
				}
			}
		}
		$("#idOk").click(seleccionarProvincia)		
	}
);
function seleccionarProvincia(){
	try{
		if(validarCamposRequeridos("idPanel")){
            realizoTarea=true;
			rptaCallback=[{provincia:$("#idProvincia_r").val(), departamento:$("#idDepartamento_r").val()}]
			parent.$.fancybox.close();
		}
	}catch(err){
		emitirErrorCatch(err, "seleccionarProvincia")
	}
}
