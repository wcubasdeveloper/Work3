var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var modulo = "Local";
var heightMant = 405;
var widthMant = 500;
var idField = "idLocal";
var tableDB = "Local";

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
            {campo:'idLocal', alineacion:'center'},
            {campo:'Nombre', alineacion:'left'},
			{campo:'estado', alineacion:'center'},
			{campo:'RUC', alineacion:'center'},
			{campo:'direccion', alineacion:'left'}
        ];
		var arrayColumnWidth=[
            { "width": "5%"},
            { "width": "25%" },
			{ "width": "15%" },
			{ "width": "20%" },
			{ "width": "35%" }
        ];
		var orderByColum=[1, "asc"];
		var height=300;
		var idTabla = "tabla_datos";	
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height);
	}catch(err){
		emitirErrorCatch(err,"listar");
	}
}