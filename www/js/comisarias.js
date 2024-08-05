var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var modulo = "Comisaria";
var heightMant = 270;
var widthMant = 500;
var idField = "idComisaria";
var tableDB = "Comisaria";

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
            {campo:'idComisaria', alineacion:'center'},
            {campo:'nombre', alineacion:'left'},
			{campo:'direccion', alineacion:'left'},
			{campo:'nombreDistrito', alineacion:'center'},
			{campo:'nombreProvincia', alineacion:'center'},
        ];
		var arrayColumnWidth=[
            { "width": "8%"},
            { "width": "20%" },
			{ "width": "32%" },
			{ "width": "20%" },
			{ "width": "20%" }
        ];
		var orderByColum=[0, "desc"];
		var height=300;
		var idTabla = "tabla_datos";	
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height);
	}catch(err){
		emitirErrorCatch(err,"listar");
	}
}