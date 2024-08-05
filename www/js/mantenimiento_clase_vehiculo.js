var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var modulo = "Clase_Vehiculo";
var heightMant = 160;
var widthMant = 500;
var idField = "idClase";
var tableDB = "Clase_Vehiculo";

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
            {campo:'idClase', alineacion:'center'},
            {campo:'nombreClase', alineacion:'left'}
        ];
		var arrayColumnWidth=[
            { "width": "10%"},
            { "width": "90%"}
        ];
		var orderByColum=[0, "asc"];
		var height=300;
		var idTabla = "tabla_datos";	
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height);
	}catch(err){
		emitirErrorCatch(err,"listar");
	}
}