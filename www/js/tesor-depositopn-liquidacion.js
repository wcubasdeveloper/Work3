var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var idLocal = $_GET("idLocal");
var idLiquidacion = $_GET("idLiquidacion");
var arrayDatos = [];

cargarInicio(function(){
	$("#idTotalCosto").prop("readonly", true);
	$("#idTotalComision").prop("readonly", true);
	$("#idTotalRecibido").prop("readonly", true);
	var parametros = "&idLocal="+idLocal;
	DAO.consultarWebServiceGet("getConcesionariosxLocal", parametros, function(data){
		var campos =  {"keyId":'idConcesionario', "keyValue":'nombreCompuesto'}
		agregarOpcionesToCombo("idCmbConcesionario", data, campos);
		$("#idCmbConcesionario").select2();
		
		var parametros = "&idLocal="+idLocal;
		DAO.consultarWebServiceGet("getPromotores", parametros, function(arrayUsuarios){ // obtiene los promotores segun el local
			var campos =  {"keyId":'idPromotor', "keyValue":'nombreUsuario'}
			agregarOpcionesToCombo("idCmbPromotor", arrayUsuarios, campos);
			$("#idCmbPromotor").select2();			
			aplicarDataTable();
            $("#txtNroLiq").val(LPAD(idLiquidacion,numeroLPAD));
            var parametros = "&idLiquidacion="+idLiquidacion
            DAO.consultarWebServiceGet("getDetallesLiquidacion", parametros, function(datos){
                $("#idFechaLiquidacion").val(datos[0].fechaLiquidacion);
                $("#idCmbConcesionario").val(datos[0].idConcesionario)
                $("#idCmbConcesionario").select2();
                $("#nroLiquidacion").val(datos[0].nroLiquidacion)
                $("#idCmbPromotor").val(datos[0].idUsuarioResp)
                $("#idCmbPromotor").select2();
                var rptaDatos = datos[0].detalle;
                for(var i=0; i<rptaDatos.length; i++){
                    rptaDatos[i].precioVentaSoles = "S/. "+rptaDatos[i].precio;
                    rptaDatos[i].comisionSoles = "S/. "+rptaDatos[i].comision;
                    var trFila = "<tr id='tr_"+rptaDatos[i].idDetalle+"' style='font-family: Arial; height: 30px; " +
                        "cursor: pointer; font-size: 12px;' onclick='seleccionarFila("+'"'+rptaDatos[i].idDetalle+'"'+")'>"+
                        "<td style='text-align:center;'>"+rptaDatos[i].nroCertificado+"</td>"+
                        "<td style='text-align:left;'>"+rptaDatos[i].claseVehiculo+"</td>"+
                        "<td style='text-align:center;'>"+rptaDatos[i].precioVentaSoles+"</td>"+
                        "<td style='text-align:center;'>"+rptaDatos[i].comisionSoles+"</td>"+
                        "<td style='text-align:center;'>S/. "+(rptaDatos[i].precio-rptaDatos[i].comision)+"</td>"+
                    "</tr>";
                    arrayDatos.push(rptaDatos[i]);
                    $("#tabla_datos > tbody").append(trFila);
                }
                $(":input").prop("disabled", true); // bloque todas las entradas (input text, radio, select)
                $(":input").css("opacity", "0.65");
                actualizarTotales();
                $.fancybox.close();
            });

		});
	});
});
function aplicarDataTable(){
	try{
		for(var i=0; i<arrayDatos.length; i++){
			arrayDatos[i].montoRecibido = parseFloat(arrayDatos[i].precioVentaSoles)-parseFloat(arrayDatos[i].comisionSoles);
		}
		var camposAmostrar = [ // asigna los campos a mostrar en la grilla
			{campo:'nroCertificado', alineacion:'center'},
			{campo:'claseVehiculo', alineacion:'center'},
			{campo:'precioVentaSoles', alineacion:'center'},
			{campo:'comisionSoles', alineacion:'center'},
			{campo:'montoRecibido', alineacion:'center'}
		];
		var columns=[
			{"width": "19%"},
			{"width": "36%"},
			{"width": "15%"},
			{"width": "15%"},
			{"width": "15%"}
		];
		crearFilasHTML("tabla_datos", arrayDatos, camposAmostrar, true, 12); // crea la tabla HTML
		parseDataTable("tabla_datos", columns, 220, false, false, false, false, function(){
            if($("#tabla_datos > tbody >tr").length==1 && $("#tabla_datos > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                $("#tabla_datos > tbody").html("");
            }
		});		
		$.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "aplicarDataTable");
	}
}
function actualizarTotales(){
	try{
		var totalPrecio = 0;
		var totalComision = 0;
		for(var i=0; i<arrayDatos.length; i++){
			totalPrecio = totalPrecio + parseInt(arrayDatos[i].precio);
			totalComision = totalComision + parseInt(arrayDatos[i].comision);
		}
		$("#idTotalCosto").val("S/. "+totalPrecio);
		$("#idTotalComision").val("S/. "+totalComision);
		$("#idTotalRecibido").val("S/. "+(totalPrecio-totalComision));
	}catch(err){
		emitirErrorCatch(err, "actualizarTotales");
	}
}
