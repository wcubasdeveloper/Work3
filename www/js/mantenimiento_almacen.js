var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var modulo = "Almacen";
var heightMant = 235;
var widthMant = 500;
var idField = "idAlmacen";
var tableDB = "Almacen";

cargarInicio(function(){
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
function listar(){
	try{
		var campoAlineacionArray=[
            {campo:'idAlmacen', alineacion:'center'},
            {campo:'nombre', alineacion:'left'},
			{campo:'ubicacion', alineacion:'left'},
			{campo:'local', alineacion:'left'},
			{campo:'responsable', alineacion:'left'}
        ];
		var arrayColumnWidth=[
            { "width": "5%"},
            { "width": "20%" },
			{ "width": "20%" },
			{ "width": "20%" },
			{ "width": "35%" }
        ];
		var orderByColum=[0, "asc"];
		var height=300;
		var idTabla = "tabla_datos";	
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height);
	}catch(err){
		emitirErrorCatch(err,"listar");
	}
}