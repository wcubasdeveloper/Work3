var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini";
var tipoBusqueda = $_GET('tipo'); // tipo de busqueda (C=Codigo; D=Descripcion)
var stringBusqueda = $_GET('busqueda'); // string a buscar
var tipoNosocomio = $_GET('tipoNosoc'); // tipo de nosocomio (H=Hospital; C=Clinica)
var orderByColumn;
var campoAbuscar;
var arrayRegistros;
cargarInicio(function(){
	$("#btnSeleccionar").click(seleccionarProcedimiento);
	buscarProcedimientos();
})
function buscarProcedimientos(){
	try{
		switch(tipoBusqueda){
			case 'C':
				campoAbuscar = "codigoProcedimiento";
				orderByColumn = [0, "asc"];
				break;
			case 'D':
				campoAbuscar = "descripcion";
				orderByColumn = [1, "asc"];
				break;
		}
		var parametros = "&campo="+campoAbuscar+
			"&busqueda="+stringBusqueda+
			"&tipoNosocomio="+tipoNosocomio;
		DAO.consultarWebServiceGet("getBusquedaProcedimientos", parametros, function(data){
			arrayRegistros=data;
			var camposAmostrar = [ // asigna los campos a mostrar en la grilla
				{campo:'codigoProcedimiento', alineacion:'center'},
				{campo:'descripcion', alineacion:'left'},
				{campo:'unidades', alineacion:'center'}
			];
			var columns=[
				{ "width": "15%"},
				{ "width": "70%"},
				{ "width": "15%"}
			];
			
			crearFilasHTML("tabla_datos", data, camposAmostrar, true, 12);
			parseDataTable("tabla_datos", columns, 185, orderByColumn, false, true);
			$.fancybox.close();
		});		
	}catch(err){
		emitirErrorCatch(err, "emitirErrorCatch");
	}
}
function seleccionarProcedimiento(){
	try{
		if(filaSeleccionada != undefined){
			var registro = arrayRegistros[filaSeleccionada];
			realizoTarea=true;
			rptaCallback = [registro];
			parent.$.fancybox.close();
		}else{
			fancyAlert("¡Debe seleccionar un procedimiento!")
		}
	}catch(err){
		emitirErrorCatch(err, "seleccionarProcedimiento");
	}
}