var codEvento = $_GET("codEvento");
var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini";
var arrayDatos = new Array();
var dataTable = undefined;
cargarInicio(function(){
    if(codEvento=='0'){
        var nombreAgraviado = $_GET("nombreAgraviado");
        var DNI = $_GET("DNI");
        var parametros = "&nombre="+nombreAgraviado+"&DNI="+DNI;
        DAO.consultarWebServiceGet("getAgraviadoXnombre_dni",parametros,listarAgraviados);
    }else{
        var parametros = "&codEvento="+codEvento;
        DAO.consultarWebServiceGet("getAgraviados", parametros, listarAgraviados);
    }
	$("#btnProvision").click(abrirVentanaProvision);
});
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
        dataTable=parseDataTable("tabla_agraviados", columns, 225, false, false, false, false);
        $.fancybox.close();
    }catch(err){
        emitirErrorCatch(err, "listarAgraviados");
    }
}
function abrirVentanaProvision(){
	try{
		if(filaSeleccionada==undefined){
            fancyAlert("Debe seleccionar un agraviado");
        }else{
			var codAgraviado = arrayDatos[filaSeleccionada].codAgraviado;
            parent.abrirVentanaFancyBox(1200, 630, "provision_gastos_agraviados?codEvento="+codEvento+"&codAgraviado="+codAgraviado+"&pagina=provision_agraviados", true);	
		}
	}catch(err){
		emitirErrorCatch(err, "abrirVentanaProvision");
	}
}