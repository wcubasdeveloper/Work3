var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var modulo = "Proveedor";
var heightMant = 250;
var widthMant = 880;
var idField = "idProveedor";
var tableDB = "Proveedor";

cargarInicio(function(){
    $("#btnBuscar").click(function(){
        paginacion.reiniciarPaginacion(); // Reinicia los valores por defecto de la paginacion
        buscar(); // realiza la busqueda de los eventos
    })
	$("#btnEditar").click(function(){
		editarAbstracto(modulo.toLowerCase(), idField, heightMant, widthMant, listar);		
	});
	$("#btnNuevo").click(function(){
		nuevoAbstracto(modulo.toLowerCase(), heightMant, widthMant, listar);		
	});
	$("#btnEliminar").click(function(){
		eliminarAbstracto(DAO, tableDB, idField, function(data){
			if(data[0]>0){
				listar();
			}else{
				fancyAlert("Operación Fallida");
			} 			
		})
	});
	listar();
})
function buscar(){
	try{
		listar();		
	}catch(err){
		emitirErrorCatch(err, "buscar")
	}
}
function listar(){
	try{
		var campoAlineacionArray=[
            {campo:'idProveedor', alineacion:'center'},
			{campo:'tipoProveedor', alineacion:'center'},
            {campo:'nombreProveedor', alineacion:'left'},
			{campo:'nroDocumento', alineacion:'center'},
			{campo:'telefonoFijo', alineacion:'center'},
			{campo:'calle', alineacion:'left'}
        ];
		var arrayColumnWidth=[
            { "width": "8%" },
            { "width": "10%" },
			{ "width": "32%" },
			{ "width": "15%" },
			{ "width": "15%" },
			{ "width": "20%" }
        ];
		var orderByColum=[0, "desc"];
		var height=320;
		var idTabla = "tabla_datos";
        var params = "&nombreProveedor="+$("#idBuscarProveedor").val().trim()
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height, params, false, true, false);
	}catch(err){
		emitirErrorCatch(err,"listar");
	}
}