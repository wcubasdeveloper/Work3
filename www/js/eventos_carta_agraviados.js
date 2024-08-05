var accion = $_GET('accion');
var codEvento = $_GET('codEvento');
var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini";
var arrayDatos = new Array();
var dataTable = undefined;
cargarInicio(function(){
	$("#btnContinuar").click(continuar);
	var parametros = "&codEvento="+codEvento;
    DAO.consultarWebServiceGet("getAgraviadosCarta", parametros, listarAgraviados);
});
function listarAgraviados(resultsData){
	try{
		for(var i=0; i<resultsData.length; i++){
			resultsData[i].gastoTotalAprox = "S/. "+resultsData[i].gastoTotalAprox;
			if(resultsData[i].totalCartas==null){
				resultsData[i].totalCartas=0;
			}
			resultsData[i].totalCartas = "S/. "+resultsData[i].totalCartas;
		}
        arrayDatos = resultsData;
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'codAgraviado', alineacion:'center'},
            {campo:'nroDocumento', alineacion:'center'},
            {campo:'nombreAgraviado', alineacion:'lef'},
			{campo:'diagnostico', alineacion:'lef'},
			{campo:'totalCartas', alineacion:'center'},
			{campo:'gastoTotalAprox', alineacion:'center'}
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_agraviados", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
        var columns=[
            { "width": "13%"},
            { "width": "10%"},
            { "width": "35%"},
			{ "width": "22%"},
			{ "width": "10%"},
			{ "width": "10%"}
        ];
        dataTable=parseDataTable("tabla_agraviados", columns, 210, false, false, false, false);
        $.fancybox.close();		
	}catch(err){
		emitirErrorCatch(err, "listarAgraviados")
	}
}
function continuar(){
	try{
		if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un agraviado");
        }else{
			switch(accion){
				case 'RP':
					var codAgraviado = arrayDatos[filaSeleccionada].codAgraviado;
					parent.abrirVentanaFancyBox(750, 630, "provision_gastos_agraviados?codEvento="+codEvento+"&codAgraviado="+codAgraviado+"&soloLectura=T&pagina=eventos_carta_agraviados", true);
					break;
				case 'NC':
					var codAgraviado = arrayDatos[filaSeleccionada].codAgraviado;
					parent.abrirVentanaFancyBox( 1200, 650, "nueva_carta_1?codEvento="+codEvento+"&codAgraviado="+codAgraviado+"&accion="+accion, true);
					break;
				default:
					var codAgraviado = arrayDatos[filaSeleccionada].codAgraviado;
					parent.abrirVentanaFancyBox(950, 360, "eventos_lista_cartas?codEvento="+codEvento+"&codAgraviado="+codAgraviado+"&accion="+accion, true);
					break;
			}	
		}				
	}catch(err){
		emitirErrorCatch(err, "continuar")
	}
}