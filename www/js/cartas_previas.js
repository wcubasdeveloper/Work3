var dataTable;
cargarInicio(function(){
	fancyAlertWait("cargando..");
	var resultsData = parent.listadoCartas
	for(var i=0; i<resultsData.length;i++){
		resultsData[i].numero=i+1		
	}
	var camposAmostrar = [ // asigna los campos a mostrar en la grilla
		{campo:'numero', alineacion:'center'},
		{campo:'etapa', alineacion:'center'},
		{campo:'nosocomio_funeraria', alineacion:'center'},
        {campo:'estadoCarta', alineacion:'center'},
        {campo:'nroCarta', alineacion:'center'},
		{campo:'fecha', alineacion:'center'},
		{campo:'asistencia', alineacion:'center'},
		{campo:'monto', alineacion:'center'}
    ];
    if(dataTable!=undefined){
        dataTable.destroy();
    }
    crearFilasHTML("tabla_cartas", resultsData, camposAmostrar, false, 10.5); // crea la tabla HTML
    var columns=[
        { "width": "4%"},
		{ "width": "19%"},
        { "width": "21%"},
        { "width": "12%"},
		{ "width": "12%"},
		{ "width": "8%"},
		{ "width": "14%"},
		{ "width": "10%"}
    ];
    dataTable=parseDataTable("tabla_cartas", columns, 417, false, false, false, false);
    $.fancybox.close();
})