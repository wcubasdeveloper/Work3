realizoTarea=true;
var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini";
var dataTable = undefined;
var arrayDatos;
var codAgraviado = $_GET("codAgraviado");
var codEvento = $_GET("codEvento");
var UIT =0;
var cobertura = [
	{
		id:1,
		nombre:"Por muerte hasta 4 UIT",
		valorUnidad:4
	},
	{
		id:2,
		nombre:"Por invalidez Permanente hasta 4 UIT",
		valorUnidad:4
	},
	{
		id:3,
		nombre:"Por incapacidad temporal hasta 1 UIT",
		valorUnidad:1
	},
	{
		id:4,
		nombre:"Por Gastos médicos hasta 5 UIT",
		valorUnidad:5
	},
	{
		id:5,
		nombre:"Por sepelio hasta 1 UIT",
		valorUnidad:1
	}
]
var mesAccidente;
var añoAccidente;
cargarInicio(function(){
	$("#btnAgregar").click(agregarMes);
	$("#btnBorrar").click(borrarMes);
	$("#btnGuardar").click(guardarProyecciones);
	var parametros = "&codAgraviado="+codAgraviado;
	DAO.consultarWebServiceGet("getProyeccionPorAgraviado", parametros, function(data){ // busca la informacion del agraviado asi como sus proyecciones de gastos
		if(data.length>0){
			UIT = data[0].UIT;
			for(var i=0; i<cobertura.length; i++){
				cobertura[i].montoCompleto = cobertura[i].valorUnidad*UIT;
				cobertura[i].nombre = cobertura[i].nombre+" (S/. "+cobertura[i].montoCompleto+")";
			}
			data[0].asociado = data[0].nombreAsociado;
			if(data[0].tipoPersona=='J'){
				data[0].asociado = data[0].razonSocial;
			}
			$("#idCodEvento").val(data[0].codEvento)
			$("#idNroCAT").val(data[0].nroCAT)
			$("#idPlaca").val(data[0].placa)
			$("#idAsociado").val(data[0].asociado)
			$("#idCodAgraviado").val(data[0].codAgraviado)
			$("#idDNI").val(data[0].DNI)
			$("#idAgraviado").val(data[0].nombreAgraviado)
			$("#idNosocomio").val(data[0].nombreNosocomio)
			$("#idDiagnostico").val(data[0].diagnostico);
			$("#idFechaAccidente").val(data[0].fechaAccidente);
			$("#idDescripcionAccidente").val(data[0].descripcionAccidente);			
			agregarOpcionesToCombo("idCobertura", cobertura, {"keyId":"id", "keyValue":"nombre"});
			$("#idCobertura").val(data[0].idCobertura);			
			var fechaCompletaAccidente = data[0].fechaAccidente.split(" ")[0];
			fechaCompletaAccidente = fechaCompletaAccidente.split("/");
			mesAccidente = fechaCompletaAccidente[1];
			añoAccidente = parseFloat(fechaCompletaAccidente[2])-2000;
			cargarProvisiones(data[0].proyecciones);
				
		}else{
			fancyAlert("¡No existe el agraviado!");
		}
	})
})
function cargarProvisiones(listaProvisiones){
	try{	
		var acumulado=0;
		for(var i=0; i<listaProvisiones.length; i++){
			listaProvisiones[i].htmlMes="<input id='mes_"+i+"' style='width: 50px; font-size:12px; text-align:center;' type='text' value='"+listaProvisiones[i].mesDesembolso+"' disabled >"; 
			listaProvisiones[i].htmlTratamiento="<textarea id='tratamiento_"+i+"' rows='2' cols='30' style='font-size:12px; text-align:center;' >"+listaProvisiones[i].tratamientoMes+"</textarea>";
			listaProvisiones[i].htmlMonto="S/. <input id='monto_"+i+"' style='width: 60px; font-size:12px; text-align:center;' type='text' value='"+listaProvisiones[i].montoAproximado+"' onkeyup='recalcularAcumulado("+'"monto_'+i+'"'+")'>";
			acumulado = acumulado + listaProvisiones[i].montoAproximado;
			listaProvisiones[i].acumulado = acumulado;			
			listaProvisiones[i].htmlAcumulado = "S/. <input id='acumulado_"+i+"' style='width: 60px; font-size:12px; text-align:center;' type='text' value='"+listaProvisiones[i].acumulado+"' disabled />";
		}
		var camposAmostrar = [ // asigna los campos a mostrar en la grilla
			{campo:'htmlMes', alineacion:'center'},
			{campo:'htmlTratamiento', alineacion:'center'},
			{campo:'htmlMonto', alineacion:'center'},
			{campo:'htmlAcumulado', alineacion:'center'}
		];
		crearFilasHTML("tabla_acumulado", listaProvisiones, camposAmostrar, true, 12); // crea la tabla HTML
		
		var columns=[
            { "width": "15%"},
            { "width": "45%"},
            { "width": "20%"},
            { "width": "20%"}
        ];
		parseDataTable("tabla_acumulado", columns, 137, false, false, false, false, function(){
            if($("#tabla_acumulado > tbody >tr").length==1 && $("#tabla_acumulado > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                $("#tabla_acumulado > tbody").html("");
            }
        });
		$.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "cargarProvisiones");
	}
}
function agregarMes(){
	try{
		var idFila = $("#tabla_acumulado > tbody >tr").length;
		var mesProyeccion="";
		var disponible=false;
		if(idFila==0){
			disponible=true;
			/*var hoy = new Date();			
			var month = hoy.getMonth()+1;
			if(month<10){
				month="0"+month;
			}
			var year =hoy.getFullYear()-2000;*/
			mesProyeccion = mesAccidente+"/"+añoAccidente;
		}else{
			// verifica que se hay insertado el monto anterior
			var montoAnterior = $("#monto_"+(idFila-1)).val();
			if(montoAnterior!=""){
				disponible=true;
				var mesPrevio = $("#mes_"+(idFila-1)).val();
				mesPrevio = mesPrevio.split("/");
				var month = parseInt(mesPrevio[0]);
				var year = parseInt(mesPrevio[1]);
				if(month==12){
					month=1;
					year++;
				}else{
					month++;
				}
				if(month<10){
					month="0"+month;
				}
				mesProyeccion = month+"/"+year;
			}			
		}
		if(disponible){
			$("#tabla_acumulado > tbody").append("<tr onclick='seleccionarFila("+'"'+idFila+'"'+")' id='tr_"+idFila+"' style='font-family: Arial; height: 20px; font-size:11px; cursor:pointer;'>" +
				"<td style='text-align: center;'><input id='mes_"+idFila+"' type='text' style='width: 50px; font-size:12px; text-align:center;' value='"+mesProyeccion+"' disabled/></td>"+
				"<td style='text-align: center;'><textarea id='tratamiento_"+idFila+"' rows='2' cols='30' style='font-size:12px; text-align:center;'/></td>"+
				"<td style='text-align: center;'>S/. <input id='monto_"+idFila+"' style='width: 60px; font-size:12px; text-align:center;' type='text' onkeyup='recalcularAcumulado("+'"monto_'+idFila+'"'+")'/></td>"+
				"<td style='text-align: center;'>S/. <input id='acumulado_"+idFila+"' style='width: 60px; font-size:12px; text-align:center;' type='text' disabled/></td>"+
			"</tr>");
		}else{
			fancyAlertFunction("¡Ingrese primero el monto del mes!", function(rpta){
				var ultimaFila = $("#tabla_acumulado > tbody >tr").length-1;
				$("#monto_"+ultimaFila).focus();
			})
		}				
	}catch(err){
		emitirErrorCatch(err, "agregarMes");
	}
}
function recalcularAcumulado(idMonto){ // recalcula el total del acumulado cuando se edita el valor del monto de un mes
	try{
		var idFila = idMonto.split("_")[1];
		var montoAcumulado = 0;
		if(idFila>0){
			if($("#acumulado_"+(idFila-1)).val()==""){
				$("#acumulado_"+(idFila-1)).val(0);
			}
			if($("#monto_"+(idFila-1)).val()==""){
				$("#monto_"+(idFila-1)).val(0);
			}
			montoAcumulado = $("#acumulado_"+(idFila-1)).val();
		}
		for(var y=idFila; y<$("#tabla_acumulado > tbody >tr").length; y++){
			if(idFila!=y){
				if($("#monto_"+y).val()==""){
					$("#monto_"+y).val(0);
				}
			}			
			montoAcumulado = parseFloat(montoAcumulado) + parseFloat(($("#monto_"+y).val()=="")?0:$("#monto_"+y).val());
			$("#acumulado_"+y).val(montoAcumulado);
		}
	}catch(err){
		emitirErrorCatch(err, "recalcularAcumulado");
	}
}
function borrarMes(){
	try{
		if(filaSeleccionada!=undefined){
			$("#tr_"+filaSeleccionada).remove();			
			var idFila = parseInt(filaSeleccionada);
			borrarFilaSeleccionada();
			recalcularTablaProyeccion(idFila);			
		}else{
			fancyAlert("¡ Debe seleccionar un Mes de Proyección !");
		}		
	}catch(err){
		emitirErrorCatch(err, "borrarMes")
	}
}
function recalcularTablaProyeccion(idFila){ // despues de borrar un mes se arrejustan la secuencia de los meses asi como tambien el acumulado
	try{
		// reasigna IDs
		for(var i=idFila; i<$("#tabla_acumulado > tbody >tr").length;i++){
			$("#tr_"+(i+1)).attr("id", "tr_"+i);
			$("#tr_"+i).attr("onclick", "seleccionarFila('"+i+"')");
			$("#mes_"+(i+1)).attr("id", "mes_"+i);
			$("#tratamiento_"+(i+1)).attr("id", "tratamiento_"+i);
			$("#monto_"+(i+1)).attr("id", "monto_"+i);
			$("#monto_"+i).attr("onkeyup","recalcularAcumulado('monto_"+i+"')");
			$("#acumulado_"+(i+1)).attr("id", "acumulado_"+i);
		}
		// reajusta Mes y Acumulado
		var montoAcumulado = 0;
		var mesProyeccion = "";
		if(idFila==0){ // el monto acumulado permanece en 0
			/*var mesInicial = $("#mes_"+idFila).val();
			mesProyeccion=getAnteriorMes(mesInicial);
			mesProyeccion=getAnteriorMes(mesProyeccion);*/
			mesProyeccion=mesAccidente+"/"+añoAccidente;
			mesProyeccion=getAnteriorMes(mesProyeccion);
		}else{
			// obtiene el mes anterior y el monto acumulado anterior
			if($("#acumulado_"+(idFila-1)).val()==""){
				$("#acumulado_"+(idFila-1)).val(0);
			}							
			montoAcumulado = $("#acumulado_"+(idFila-1)).val();
			mesProyeccion = $("#mes_"+(idFila-1)).val();			
		}
		for(var y=idFila; y<$("#tabla_acumulado > tbody >tr").length; y++){
			if($("#monto_"+y).val()==""){
				$("#monto_"+y).val(0);
			}
			montoAcumulado = parseFloat(montoAcumulado) + parseFloat($("#monto_"+y).val());
			$("#acumulado_"+y).val(montoAcumulado);	
			mesProyeccion = getSiguienteMes(mesProyeccion);
			$("#mes_"+y).val(mesProyeccion);
		}
	}catch(err){
		emitirErrorCatch(err, "recalcularTablaProyeccion");
	}
}
function getSiguienteMes(mes){
	try{
		mes = mes.split("/");
		var month = parseInt(mes[0]);
		var year = parseInt(mes[1]);
		if(month==12){
			month=1;
			year++;
		}else{
			month++;
		}
		if(month<10){
			month="0"+month;
		}
		return month+"/"+year;		
	}catch(err){
		emitirErrorCatch(err, "getSiguienteMes")
	}
}
function getAnteriorMes(mes){
	try{
		mes = mes.split("/");
		var month = parseInt(mes[0]);
		var year = parseInt(mes[1]);
		if(month==1){
			month=12;
			year--;
		}else{
			month--;
		}
		if(month<10){
			month="0"+month;
		}
		return month+"/"+year;		
	}catch(err){
		emitirErrorCatch(err, "getAnteriorMes")
	}
}
function guardarProyecciones(){
	try{
		if(validarCamposRequeridos("divAgraviado")){
			if($("#tabla_acumulado > tbody >tr").length>0){
				var listaProyecciones = [];
				var totalAcumulado=0;
				for(var y=0; y<$("#tabla_acumulado > tbody >tr").length; y++){
					listaProyecciones.push({
						mes : $("#mes_"+y).val(),
						tratamiento:$("#tratamiento_"+y).val(),
						monto:$("#monto_"+y).val()						
					});
					totalAcumulado = totalAcumulado + parseFloat(($("#monto_"+y).val()=="")?0:$("#monto_"+y).val());
				}
				var cantUIT=0;
				for(var i=0; i<cobertura.length; i++){
					if(cobertura[i].id==$("#idCobertura").val()){
						cantUIT=cobertura[i].valorUnidad;
						break;
					}
				}
				var parametrosPost={
					listaProyecciones:listaProyecciones,
					totalAcumulado:totalAcumulado,
					codEvento:codEvento,
					codAgraviado:codAgraviado,
					maxUIT:cantUIT,
					idCobertura:$("#idCobertura").val()
				}
				fancyConfirm("¿ Desea proseguir con el registro ?", function(rpta){
					if(rpta){
						DAO.consultarWebServicePOST(parametrosPost, "registrarProyecciones", function(data){
							if(data[0]>0){
								fancyAlertFunction("¡Se guardaron los registros correctamente!", function(rpta){
									parent.abrirVentanaFancyBox(700, 360, "provision_agraviados?codEvento="+codEvento, true);
								})
							}
						});
					}
				});
			}else{
				fancyAlert("¡Debe ingresar al menos un mes de Proyección!");
			}		
		}		
	}catch(err){
		emitirErrorCatch(err, "guardarProyecciones");
	}
}