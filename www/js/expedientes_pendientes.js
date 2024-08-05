var dataTable;
cargarInicio(function(){
	fancyAlertWait("Cargando");
	var arrayExpedientesPendientes=parent.notificacionesPendientes;
	var CampoAlineacionArray=[
        {campo:'idExpediente', alineacion:'center', LPAD:true },
        {campo:'nombreUsuario', alineacion:'left'},
        {campo:'nombreArea', alineacion:'center'}
    ];
    if(dataTable!=undefined){
        dataTable.destroy(); // elimina
    }
    crearFilasHTML("tabla_datos", arrayExpedientesPendientes, CampoAlineacionArray, false, 12);
    var arrayColumnWidth=[
        { "width": "30%"},
        { "width": "40%" },
        { "width": "30%" }
    ];
    var orderByColum=[0, "asc"];
    dataTable=parseDataTable("tabla_datos", arrayColumnWidth, 220, orderByColum, false, false);
    $.fancybox.close();
})