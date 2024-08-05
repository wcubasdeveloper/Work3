var conoDefecto=14; // contiene el valor del cono defecto : CONO CENTRAL
var datatable=undefined;
var arrayData=new Array(); // contiene todos los resultados
var arrayDepartamentos = new Array();
var arrayProvincias = new Array();
var arrayDistritos = new Array();
cargarInicio(function(){
    consultarWebServiceGet2("getAllDistritos", "", function(datos){
        arrayDistritos=datos;
        consultarWebServiceGet2("getAllProvincias", "", function(datos2){
            arrayProvincias=datos2;
            consultarWebServiceGet2("getAllDepartamentos", "", function(datos3){
                arrayDepartamentos=datos3;
                consultarWebServiceGet2("getAllCorredores", "", function(info){
                    for(var i=0; i<info.length; i++){
                        $("#filtro_Corredor").append(new Option(info[i].nombre, info[i].id_corredor))
                    }
                    $("#filtro_Corredor").val(conoDefecto);
                    $("#filtro_Corredor").change(function(){
                        var cono=$("#filtro_Corredor").val();
                        cargarListaConcesionarios(cono);
                    })
                    cargarListaConcesionarios();
                })                
            })
        })    
    })	
	$("#idEditar").click(abrirVentanaEdicion) 
});
function cargarListaConcesionarios(cono){
	try{
        if(cono==undefined){
            cono=conoDefecto;
        }
        var parametros="&cono="+cono;
		consultarWebServiceGet2("getAllConcecionarios", parametros, mostrarLista); // consulta al webservice intranetDB.php
	}catch(err){
		emitirErrorCatch(err, "cargarListaConcesionarios")
	}
}
function mostrarLista(data){
	try{
        arrayData=data;
		var CampoAlineacionArray=[
            {campo:'razonSocial', alineacion:'left'},
            {campo:'direccion', alineacion:'left'},
            {campo:'telefono', alineacion:'center'},
            {campo:'celular', alineacion:'center'},
            {campo:'email', alineacion:'left'}];
        if(datatable!=undefined){
            datatable.destroy(); // elimina
        }
        crearFilasHTML("tabla_datos", data, CampoAlineacionArray, true);
        // Asignamos dataTables a la tabla ya creada
        var arrayColumnWidth=[
            { "width": "20%"},
            { "width": "40%"},
            { "width": "10%"},
            { "width": "10%"},
            { "width": "20%"}
        ];
        var orderByColum=[0, "asc"];
        datatable=parseDataTable("tabla_datos", arrayColumnWidth, 353, orderByColum, false, true);
        $.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "mostrarLista")
	}
}
function abrirVentanaEdicion(){
	try{
		if(filaSeleccionada!=undefined){
            abrirVentanaFancyBox(550, 470, "editarconcesionario", true)        
        }else{
            fancyAlert("Por favor seleccione un concecionario");
        }
	}catch(err){
		emitirErrorCatch(err, "abrirVentanaEdicion")
	}
}