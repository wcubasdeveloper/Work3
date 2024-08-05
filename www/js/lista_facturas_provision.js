var DAO = new DAOWebServiceGeT("wbs_as-sini")
var codAgraviado = $_GET("codAgraviado")
var idEtapa = $_GET("idEtapa")
var dataTable;
cargarInicio(function(){
    fancyAlertWait("cargando..");
    $("#codAgraviado").val(parent.$("#idAgraviado").val())
    var data = [] // registros de facturas
    for(var y=0;y<parent.cobertura.length; y++){
        if(parent.cobertura[y].id==parseInt(idEtapa)){
            var cobertura = parent.cobertura[y].nombre.split("(")[0];
            $("#idTipoGasto").val(cobertura)
            data = parent.cobertura[y].arrayFacturas;
            break;
        }
    }
    var total = 0;
    for(var i=0; i<data.length; i++){
		data[i].count=i+1
        data[i].montoSoles = number_format(data[i].monto, 2, '.', ',')
        total = total + data[i].monto
    }
    total =  "S/. "+number_format(total, 2, '.', ',')
    $("#idTotal").val(total);
    var camposAmostrar = [ // asigna los campos a mostrar en la grilla
        {campo:'count', alineacion:'center'},
		{campo:'numero', alineacion:'left'},
        {campo:'fechaDoc', alineacion:'center'},
        {campo:'montoSoles', alineacion:'right'}
    ];
    if(dataTable!=undefined){
        dataTable.destroy();
    }
    crearFilasHTML("tabla_cartas", data, camposAmostrar, false, 11); // crea la tabla HTML
    var columns=[
        { "width": "5%"},
		{ "width": "45%"},
        { "width": "25%"},
        { "width": "25%"}
    ];
    dataTable=parseDataTable("tabla_cartas", columns, 366, false, false, false, false);


    $.fancybox.close();

})