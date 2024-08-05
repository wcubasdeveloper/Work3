var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var modulo = "UsoClaseVehiculo";
var heightMant = 215;
var widthMant = 500;
var idField = "idUsoClaseVehiculo";
var tableDB = "UsoClaseVehiculo";

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
	DAO.consultarWebServiceGet("getListaUso_Vehiculo", "", function(data){
		agregarOpcionesToCombo("idUso", data, {"keyId":"idUso", "keyValue":"nombreUso"});
		$("#idUso").find("option").eq(0).remove();
		$("#idUso").change(listar);
		$.fancybox.close();
		$("#idUso").change();
	})
})
function listar(){
	try{
		var campoAlineacionArray=[
            {campo:'nombreClase', alineacion:'left'},
			{campo:'prima', alineacion:'center'},
			{campo:'montoPoliza', alineacion:'center'}
        ];
		var arrayColumnWidth=[
            { "width": "50%"},
			{ "width": "25%"},
			{ "width": "25%"}
        ];
		var orderByColum=[0, "asc"];
		var height=300;
		var idTabla = "tabla_datos";
		var params = "&idUso="+$("#idUso").val();
		listarAbstracto(DAO, modulo, campoAlineacionArray, arrayColumnWidth, orderByColum, idTabla, height, params);
	}catch(err){
		emitirErrorCatch(err,"listar");
	}
}