var contenidoHTMLExcel="";
var dataTable;
var arrayExpedientes;
cargarInicio(function(){
	var tipoFiltro=parent.idUsuario; // Todos
	if(parent.usuario_Notificar1==parent.idUsuario || parent.usuario_Notificar2==parent.idUsuario){
		tipoFiltro='T'; // Todos
		$("#idPanelFiltro").css("display", "block"); // Lo muestra
		$("#idFiltro").change(function(){
			var filtro = this.value;
			if(filtro=='U'){ // Expedientes Del usuario
				filtro=parent.idUsuario;
			}
			buscarExpedientesCriticos(filtro);
		})
	}
	buscarExpedientesCriticos(tipoFiltro);
	$("#idBtnDescargar").click(function(){
		if(contenidoHTMLExcel!=""){
			generarExcelConJqueryYhtml(contenidoHTMLExcel, "Reportes Criticos")
		}else{
			fancyAlert("No se puede descargar Excel, porque no hay ningun expediente critico");
		}
	})
})
function buscarExpedientesCriticos(filtro){
	try{
		contenidoHTMLExcel="";
		var parametros="&esUsuarioAnotificar="+filtro+
            "&tiempoCritico="+parent.tiempoCritico;
        consultarWebServiceGet("getExpedientesCriticos",parametros, function(data){
        	for(var i=0; i<data.length; i++){
				data[0].codExp = CompletarConCeros(data[0].idExpediente, numeroLPAD);
        		switch(data[i].estadoNotificacion){
        			case '0':
        				data[i].estadoNotif='Por Derivar';
        				break;
        			case '1':
        				data[i].estadoNotif='Pend. Recibir';
        				break;
        		}
        		data[i].idExpediente=" "+data[i].idExpediente;
        	}
        	var CampoAlineacionArray=[
		        {campo:'codExp', alineacion:'center'},
		        {campo:'fechaIngreso', alineacion:'center'},
		        {campo:'areaOrigen', alineacion:'center'},
		        {campo:'usuarioOrigen', alineacion:'left'},
		        {campo:'areaDestino', alineacion:'center'},
		        {campo:'usuarioDestino', alineacion:'left'},
		        {campo:'estadoNotif', alineacion:'center'},
		        {campo:'diasRespuesta', alineacion:'center'}	        
		    ];
		    if(dataTable!=undefined){
		        dataTable.destroy(); // elimina
		    }
		    arrayExpedientes=data;
		    crearFilasHTML("tabla_datos", data, CampoAlineacionArray, false, 11);
			numerosComoStringEnTablaExcel("tabla_datos");
		    if(data.length>0){
		    	contenidoHTMLExcel=$("#tabla_datos")[0].outerHTML;
		    }		    
		    var arrayColumnWidth=[
		        { "width": "10%" },
		        { "width": "10%" },
		        { "width": "15%" },
		        { "width": "15%" },
		        { "width": "15%" },
		        { "width": "15%" },
		        { "width": "10%" },
		        { "width": "10%" },
		    ];
		    var orderByColum=[1, "asc"];
		    dataTable=parseDataTable("tabla_datos", arrayColumnWidth, 320, orderByColum, false, true);
		    $.fancybox.close();
        });
	}catch(err){
		emitirErrorCatch(err, "buscarExpedientesCriticos")
	}
}