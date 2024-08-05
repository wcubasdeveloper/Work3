var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var modulo = "EmpresaTransp";
var heightMant = 250;
var widthMant = 880;
var idField = "idEmpresaTransp";
var tableDB = "EmpresaTransp";

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
            {campo:'idEmpresaTransp', alineacion:'center'},
			{campo:'razonSocial', alineacion:'left'},
            {campo:'nombreCorto', alineacion:'left'},
			{campo:'nroResolucion', alineacion:'center'},
			{campo:'telefonoFijo', alineacion:'center'},
			{campo:'representanteLegal', alineacion:'left'}
        ];
		var arrayColumnWidth=[
            { "width": "5%" },
            { "width": "30%" },
			{ "width": "15%" },
			{ "width": "15%" },
			{ "width": "10%" },
			{ "width": "25%" }
        ];
		var orderByColum=[0, "desc"];
		var height=330;
		var idTabla = "tabla_datos";
        var params = "&nombreEmpresa="+$("#idBuscarNombre").val().trim()
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height, params, false, true, false);
	}catch(err){
		emitirErrorCatch(err,"listar");
	}
}