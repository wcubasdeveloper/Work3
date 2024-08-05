var idLocal = 0;
var idPerfil = parent.perfilUsuario1;
if(idPerfil!=1 && idPerfil!=2){
	idLocal = parent.idLocal;
}
var dataReporte;
var DAO = new DAOWebServiceGeT("wbs_ventas")
cargarInicio(function(){
	// carga los concesionarios
	var parametros = "&idLocal="+idLocal;
	DAO.consultarWebServiceGet("getAllConcesionarios", parametros, function(data){
		var campos =  {"keyId":'idConcesionario', "keyValue":'nombreCompuesto'}
		agregarOpcionesToCombo("idCmbConcesionario", data, campos);
		$("#idCmbConcesionario").select2();
		// Carga los promotores:
		var parametros = "&idLocal="+idLocal;
		DAO.consultarWebServiceGet("getPromotores", parametros, function(arrayUsuarios){ // obtiene los promotores segun el local
			var campos =  {"keyId":'idPromotor', "keyValue":'nombreUsuario'}
			agregarOpcionesToCombo("idCmbPromotor", arrayUsuarios, campos);
			$("#idCmbPromotor").select2();
			//$(":input").prop("disabled", true); 
			//$("#btnBuscar").prop("disabled", false);
			$('input[name=seleccion]').on("change", tipoReporte);			
			$.fancybox.close();
			$('input[name=seleccion]:checked').change();
			$("#btnBuscar").click(buscar);
		});
	});
});
function tipoReporte(){
	try{
		var tipo = $('input[name=seleccion]:checked').val();
		$("#idInicio").attr("requerido", "");
		$("#idInicio").prop("disabled", true);
		$("#idFin").attr("requerido", "");
		$("#idFin").prop("disabled", true);
		
		$("#idCmbConcesionario").attr("requerido", "");
		$("#idCmbConcesionario").prop("disabled", true);
		
		$("#idCmbPromotor").attr("requerido", "");
		$("#idCmbPromotor").prop("disabled", true);
		
		$('input[name=semana]').prop("disabled", true);
		
		switch(tipo){
			case 'CER': // por numero de certificado
				$("#idInicio").attr("requerido", "Nro Inicial");
				$("#idInicio").prop("disabled", false);
				$("#idFin").prop("disabled", false);
				$("#idInicio").focus();
				break;
			case 'CON': // por concesionario
				$("#idCmbConcesionario").attr("requerido", "Concesionario");
				$("#idCmbConcesionario").prop("disabled", false);
				$("#idCmbConcesionario").select2();
				$("#idCmbConcesionario").select2("open");
				break;
			case 'PRO': // por procurador y dia de visita al concesionario 
				$("#idCmbPromotor").attr("requerido", "Promotor");
				$("#idCmbPromotor").prop("disabled", false);
				$("#idCmbPromotor").select2();
				$("#idCmbPromotor").select2("open");
				$('input[name=semana]').prop("disabled", false);
				break;
		}
		
	}catch(err){
		emitirErrorCatch(err, "tipoReporte");
	}
}
function buscar(){
	try{
		if(validarCamposRequeridos("Layer1")){
			var tipoReporte = $('input[name=seleccion]:checked').val();
			var parametros = "";
			switch(tipoReporte){
				case 'CER':
					parametros = "&inicio="+$("#idInicio").val()+"&fin="+$("#idFin").val();
					break;
				case 'CON':
					parametros = "&idConcesionario="+$("#idCmbConcesionario").val();
					break;
				case 'PRO':
					var diasArray = [];
					$('input[name=semana]:checked').each(function(){
						var diaSemana = $(this).val();
						diasArray.push("'"+diaSemana+"'");
					})
					parametros = "&idPromotor="+$("#idCmbPromotor").val()+"&dias="+diasArray;
					break;
			}
			parametros = parametros+"&tipoReporte="+tipoReporte;
			DAO.consultarWebServiceGet("generarReporteCertificado", parametros, function(data){
				dataReporte = data;
				$.fancybox.close();
				parent.abrirVentanaFancyBox(1050, 560, "detalle_reporte?tipoReporte="+tipoReporte+
					"&inicio="+$("#idInicio").val()+
					"&fin="+$("#idFin").val()+
					"&nombreConcesionario="+$("#idCmbConcesionario option:selected").text()+
					"&nombrePromotor="+$("#idCmbPromotor option:selected").text()+"&dias="+$('input[name=semana]:checked').val(), true);
			});
		}		
	}catch(err){
		emitirErrorCatch(err, "buscar");
	}
}