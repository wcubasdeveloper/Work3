var dataFiltro;
var paginacion;
var arrayRegistros=new Array();
var dataTable;
var nombreLabel="";
cargarInicio(function(){
	paginacion = new Paginacion();
	$("input[type='radio'][name='busqueda']").change(validarSeleccionCheck)
	$("#inicio").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("#fin").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
	$("#idBuscarCita").click(buscarCita)
	$("#btnAtender").click(function(){
		mantenimientoCita('2'); // Atender
	});
	$("#btnCancelar").click(function(){
		mantenimientoCita('3'); // Cancelar
	});
});
function mantenimientoCita(tipoAccion){
	try{
		if(filaSeleccionada!=undefined){
			if(arrayRegistros[filaSeleccionada].estado=='1'){ // el estado de la cita es Pendiente 
				var idCitaSelec=arrayRegistros[filaSeleccionada].idCita;
				var parametros="?accion="+tipoAccion+"&idCita="+idCitaSelec;
				abrirVentanaFancyBox(500, 250, "mantenimiento_cita"+parametros, true, function(data){
					if(data[0].filasAfectadas>0){
						buscarCita();
					}
				});
			}else{
				fancyAlert("Debe Seleccionar una cita en estado Pendiente")
			}			
		}else{
			fancyAlert("Debe Seleccionar una cita")
		}
	}catch(err){
		emitirErrorCatch(err, "mantenimientoCita")
	}
}
function validarSeleccionCheck(){
	try{		
		var valorSeleccionado=$("input[type='radio'][name='busqueda']:checked").val(); // obtiene el valor del radio seleccionado
		$("#panel_busqueda").css("display", "block"); // Oculta el Panel de Busqueda
		if(valorSeleccionado=='F'){ // Fecha de Cita
			$("#buscar_x_codigo").css("display", "none");
			$("#buscar_x_fechas").css("display", "block");
			$("#idBuscarCita").css("display", "block")
			$("#inicio").focus();	
		}else{
			//var nombreLabel; // nombre de label
			switch(valorSeleccionado){
				case 'E':
					nombreLabel='Nro Expediente';
					break;
				case 'C':
					nombreLabel='Nro CAT';
					break;
				case 'P':
					nombreLabel='Placa';
					break;
			}
			$("#buscar_x_fechas").css("display", "none");
			$("#buscar_x_codigo").css("display", "block");
			$("#idBuscarCita").css("display", "block")
			//$("#idLabel").html("<p class='Body-P'><span class='Body-C'>"+nombreLabel+"</span></p>");
			labelTextWebPlus("idLabel",nombreLabel)
			$("#codigo").focus();
		}
	}catch(err){
		emitirErrorCatch(err, "validarSeleccionCheck")
	}
}
function buscarCita(){
	try{
		if($("input:checked").length>0){
			var campoValidar;
			var valorSeleccionado=$("input[type='radio'][name='busqueda']:checked").val(); // valor seleccionado
			var parametros="&tipoBusqueda="+valorSeleccionado;
			if(valorSeleccionado=="F"){ // Por fecha
				campoValidar="inicio-Fecha de Inicio";
				parametros+="&fechaInicio="+dateTimeFormat($("#inicio").val())+
							"&fechaFin="+dateTimeFormat($("#fin").val());
			}else{
				campoValidar="codigo-"+nombreLabel;
				parametros+="&codigo="+$("#codigo").val();
			}
			if(validarInputsValueXid(campoValidar)){
				if($("#inicio").val()==$("#fin").val() && valorSeleccionado=='F'){
					fancyAlertFunction("La fecha de Inicio y Fin no pueden ser iguales", function(estado){
						if(estado){
							$("#inicio").focus();
						}
					});
				}else{
					$("#oculta").css("display", "block");
					dataFiltro=parametros;
					paginacion.registrosXpagina=5;
					paginacion.paginaActual = 1; // Reinicia las variables al estado inicial
					paginacion.cantPaginas = 0;
					// agrege los parametros de la paginacion:
					parametros=parametros+"&page="+paginacion.paginaActual+
						"&cantPaginas="+paginacion.cantPaginas+
						"&registrosxpagina="+paginacion.registrosXpagina;
					consultarWebServiceGet("getcitas", parametros, function(data){
						arrayRegistros=data;
						cargarTablaCitas(data);
					});
				}
			}
		}else{
			fancyAlert("Debe seleccionar un tipo de busqueda");
		}
	}catch(err){
		emitirErrorCatch(err, "buscarCita")
	}
}
function cargarTablaCitas(data){
	try{
		//console.log(data);
		for(var i=0; i<data.length; i++){
			switch(data[i].estado){
				case '1': // Pendiente
					data[i].estadNombre="Pendiente";
					break;
				case '2': // Atendida
					data[i].estadNombre="Atendida";
					break;
				case '3': // Cancelada
					data[i].estadNombre="Cancelada";
					break;
			}
			switch(data[i].tipoExpediente){
				case '1':
					data[i].tipo='Solicitud Reembolso por Gastos médicos';
					break;
				case '2':
					data[i].tipo='Solicitud Indemnización por Muerte';
					break;
				case '3':
					data[i].tipo='Solicitud Indemnización por Sepelio';
					break;
				case '4':
					data[i].tipo='Solicitud Indemnización por Incapacidad Temporal';
					break;
				case '5':
					data[i].tipo='Solicitud Indemnización por Invalidez Permanente';
					break;
				case '6':
					data[i].tipo='Solicitud de Subsanacion';
					break;
				case '7':
					data[i].tipo='Documento Administrativo';
					break;
				case '9':
					data[i].tipo='Otros';
					break;
			}
		}
		arrayRegistros=data;
		var CampoAlineacionArray=[
            {campo:'fechaCita', alineacion:'center'},
            {campo:'estadNombre', alineacion:'center'},
            {campo:'nombresAgraviado', alineacion:'left'},
            {campo:'idExpediente', alineacion:'center', LPAD:true},
            {campo:'tipo', alineacion:'center'},
            {campo:'nroCAT', alineacion:'center'},
            {campo:'codEvento', alineacion:'center'}
        ];
        if(dataTable!=undefined){
            dataTable.destroy(); // elimina
        }
        crearFilasHTML("tabla_datos", data, CampoAlineacionArray, true, 10.5);
        var arrayColumnWidth=[
            { "width": "10%", "type":"date-euro"},
            { "width": "10%"},
            { "width": "30%"},
            { "width": "10%"},
        	{ "width": "20%"},
        	{ "width": "10%"},
        	{ "width": "10%"}
        ];
        var orderByColum=[0, "desc"];
        dataTable=parseDataTable("tabla_datos", arrayColumnWidth, 248, orderByColum, false, true, false, function(){
			if(arrayRegistros.length>0){
				var numeroPaginas = arrayRegistros[0].numeroPaginas;
				if(typeof numeroPaginas != "undefined"){
					paginacion.cargarPaginacion(numeroPaginas, "pagination", paginacion, function(page){
						var parametros=dataFiltro;
						paginacion.paginaActual = page;
						// agrege los parametros de la paginacion:
						parametros=parametros+"&page="+paginacion.paginaActual+
							"&cantPaginas="+paginacion.cantPaginas+
							"&registrosxpagina="+paginacion.registrosXpagina;
						consultarWebServiceGet("getcitas", parametros, function(data){
							arrayRegistros=data;
							cargarTablaCitas(data);
						});
					});
				}
			}else{
				paginacion.cargarPaginacion(0, "pagination");
			}
		});
		$.fancybox.close()
		$("#oculta").css("display", "none");		
	}catch(err){
		emitirErrorCatch(err, "cargarTablaCitas")
	}
}