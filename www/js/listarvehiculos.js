$(document).ready(function(){
// cargar accidentes	
	cargarListaDeVehiculos();
});
var tipoAccion=""; // Editar o Nuevo
var idInforme;
var datatableVehiculos;
var arrayListaVehiculos;

/* @cargarListaDeVehiculos: Busca los vehículos del evento seleccionado anteriormente.
*/
function cargarListaDeVehiculos(){
    try{
    	idInforme=parent.arrayEventos[parent.filaSeleccionada].idInforme;
        fancyAlertWait("Cargando");
        var parametros="&idInforme="+idInforme;
        consultarWebServiceGet("getVehiculosXidInforme", parametros, cargarTablaVehiculos);

    }catch(err){
        emitirErrorCatch(err, "cargarListaDeVehiculos"); // emite error
    }
}
/* @cargarTablaVehiculos: Lista los vehiculos que se obtuvieron
    PARAMETROS:
        1) rptaWebservice: array JSON de los vehiculos implicados
*/
function cargarTablaVehiculos(rptaWebservice){
	try{
		arrayListaVehiculos=rptaWebservice;
        if(datatableVehiculos!=undefined){
            datatableVehiculos.destroy();
            $('#tabla_datos > tbody').html("");
        }
        for(var i=0; i<rptaWebservice.length; i++){
            $("#tabla_datos > tbody").append("<tr id='tr_"+i+"' style='height:30px; font-size:11px; font-family:Arial; cursor:pointer;' onclick='seleccionarFila("+'"'+i+'"'+")' >"+
                "<td style='vertical-align: middle; '><center>"+quitarEspaciosEnBlanco(rptaWebservice[i].placa)+"</center></td>"+
                "<td style='vertical-align: middle; text-align:center;'>"+quitarEspaciosEnBlanco(rptaWebservice[i].motor)+"</td>"+
                "<td style='vertical-align: middle;'><center>"+quitarEspaciosEnBlanco(rptaWebservice[i].marca)+"</center></td>"+
                "<td style='vertical-align: middle;'>"+quitarEspaciosEnBlanco(rptaWebservice[i].anno)+"</td>"+
                "<td style='vertical-align: middle;'>"+quitarEspaciosEnBlanco(rptaWebservice[i].color)+"</td>"+
                "</tr>");
        }
        datatableVehiculos=$('#tabla_datos').DataTable({
            "searching": true,
            "paging": false,
            "scrollY":"280px",
            "pagingType": "simple",
            "info":     false,
            "lengthChange": false,
            "scrollCollapse": false,
            "language": {
                "search": "Buscar:",
                "lengthMenu": "Visualizar _MENU_ por pag.",
                "zeroRecords": "Ningun Resultado - Lo Sentimos :(",
                "info": "Pag _PAGE_ de _PAGES_",
                "infoEmpty": "No Disponible",
                "infoFiltered": "(Filtrado de _MAX_ registros)"
            },
            "order": [[ 0, "desc" ]],
            //"bSort": false,
            "columns": [
                { "width": "20%" },
                { "width": "20%" },
                { "width": "20%" },
                { "width": "20%" },
                { "width": "20%" }
            ]
        });
        $.fancybox.close();  

	}catch(err){
        emitirErrorCatch(err, "cargarTablaVehiculos"); // emite error
    }
}
function editarVehiculo(){
	try{
		if(filaSeleccionada==undefined){
			fancyAlert("Por favor seleccione un vehiculo");
		}else{
		    tipoAccion="E";
			abrirFancyBox(870, 320, "editarvehiculo", true);	
		}
	}catch (err){
         emitirErrorCatch(err, "editarAgraviado"); // emite error
    }
}
function nuevoVehiculo(){
    try{
        tipoAccion="N";
        abrirFancyBox(870, 320, "editarvehiculo", true);
    }catch(err){
        emitirErrorCatch(err, "nuevoAgraviado");
    }
}