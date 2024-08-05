var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini";
var paginacion = new Paginacion(); // Instancia del plugin para la paginacion
var dataTable = undefined;
var arrayDatos;
cargarInicio(function(){
	$("#btnBuscarAgraviado").click(buscarAgraviado);
	$("#btnProvision").click(abrirVentanaProvision);
});
function buscarAgraviado(){
	try{
		if($("#nombreAgraviado").val().trim()=="" && $("#idDNI").val().trim()==""){
            fancyAlertFunction("¡Debe ingresar al menos un parámetro para la búsqueda del agraviado!",function(){
                $("#nombreAgraviado").focus();
            })
        }else{
			var nombreAgraviado = $("#nombreAgraviado").val().trim();
			var DNI = $("#idDNI").val().trim();
			var parametros = "&nombre="+nombreAgraviado+"&DNI="+DNI;
			DAO.consultarWebServiceGet("getAgraviadoXnombre_dni",parametros,listarAgraviados);
        }		
	}catch(err){
		emitirErrorCatch(err, "buscarAgraviado");
	}
}
function listarAgraviados(resultsData){
    try{
		for(var i=0; i<resultsData.length; i++){
			resultsData[i].gastoTotalAprox = "S/. "+resultsData[i].gastoTotalAprox;
		}
        arrayDatos = resultsData;
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'codAgraviado', alineacion:'center'},
            {campo:'codEvento', alineacion:'center'},
            {campo:'nroDocumento', alineacion:'center'},
            {campo:'nombreAgraviado', alineacion:'lef'},
			{campo:'gastoTotalAprox', alineacion:'center'}
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_agraviados", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
        var columns=[
            { "width": "20%" },
            { "width": "18%"},
            { "width": "12%"},
            { "width": "35%"},
			{ "width": "15%"}
        ];
        dataTable=parseDataTable("tabla_agraviados", columns, 280, false, false, false, false);
        $.fancybox.close();
		$("#idOculta").css("display", "none");
	}catch(err){
        emitirErrorCatch(err, "listarAgraviados");
    }
}
function abrirVentanaProvision(){
	try{
		if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un agraviado");
        }else{
			var informeCerrado = arrayDatos[filaSeleccionada].informeCerrado;
			var codEvento = arrayDatos[filaSeleccionada].codEvento;
			if(informeCerrado=='S'){

				var codAgraviado = arrayDatos[filaSeleccionada].codAgraviado;
				
				parent.abrirVentanaFancyBox(1200, 630, "provision_gastos_agraviados?codEvento="+codEvento+"&codAgraviado="+codAgraviado, true, function(){
					buscarAgraviado();
				},true);				
			}else{
				fancyAlert("¡No se puede proseguir con la operación, por que el informe del evento "+codEvento+" no ha sido cerrado!");
			}			
		}
	}catch(err){
		emitirErrorCatch(err, "abrirVentanaProvision");
	}
}