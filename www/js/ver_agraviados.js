var codEvento = $_GET('codEvento');
var dataTable=undefined;
var DAO = new DAOWebServiceGeT("wbs_as-sini")
cargarInicio(function(){
	var parametros = "&codEvento="+codEvento;
        DAO.consultarWebServiceGet("getAgraviados", parametros, function(data){
			var camposAmostrar = [ // asigna los campos a mostrar en la grilla
				{campo:'codAgraviado', alineacion:'center'},
				{campo:'dniAccidente', alineacion:'center'},
				{campo:'nombreAccidente', alineacion:'left'},
				{campo:'edadAccidente', alineacion:'center'},
				{campo:'diagnosticoAccidente', alineacion:'left'}
			];
			if(dataTable!=undefined){
				dataTable.destroy();
			}
			crearFilasHTML("tabla_agraviados", data, camposAmostrar, false, 12); // crea la tabla HTML
			var columns=[
				{ "width": "10%" },
				{ "width": "10%" },
				{ "width": "33%" },
				{ "width": "5%"  },
				{ "width": "42%" }
			];
			dataTable=parseDataTable("tabla_agraviados", columns, 270, false, false, false, false);
			$.fancybox.close();
		});
})