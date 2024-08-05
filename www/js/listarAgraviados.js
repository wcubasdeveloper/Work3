$(document).ready(function(){
// cargar accidentes	
	cargarListaDeAgraviados();
});
var tipoAccion=""; // Editar o Nuevo
var codEvento;
var datatableAgraviados;
var arrayListaAgraviados;

/* @cargarListaDeAgraviados: Obtiene los agraviado del evento seleccionado
*/
function cargarListaDeAgraviados(){
    try{
    	codEvento=parent.arrayEventos[parent.filaSeleccionada].numcentral;
        fancyAlertWait("Cargando");
        var parametros="&codEvento="+codEvento;
        consultarWebServiceGet("getAgraviadosXcodEvento", parametros, cargarTablaAgraviados);

    }catch(err){
        emitirErrorCatch(err, "cargarListaDeAgraviados"); // emite error
    }
}

/* @cargarTablaAgraviados: Lista los agraviados encontrados
    PARAMETROS: 
        1) rptaWebservice: registro de agraviados JSON
*/
function cargarTablaAgraviados(rptaWebservice){
	try{
		arrayListaAgraviados=rptaWebservice;
        if(datatableAgraviados!=undefined){
            datatableAgraviados.destroy();
            $('#tabla_datos > tbody').html("");
        }
        for(var i=0; i<rptaWebservice.length; i++){
            var telf=rptaWebservice[i].telefonoMovil;
            if(telf==null || telf==undefined){
                telf="";
            }
            $("#tabla_datos > tbody").append("<tr id='tr_"+i+"' style='height:30px; font-size:11px; font-family:Arial; cursor:pointer;' onclick='seleccionarFila("+'"'+i+'"'+")' >"+
                "<td style='vertical-align: middle; '><center>"+rptaWebservice[i].nombres+" "+rptaWebservice[i].apellidoPaterno+" "+rptaWebservice[i].apellidoMaterno+"</center></td>"+
                "<td style='vertical-align: middle; text-align:center;'>"+rptaWebservice[i].nroDocumento+"</td>"+
                "<td style='vertical-align: middle;'><center>"+telf+"</center></td>"+
                "<td style='vertical-align: middle;'>"+rptaWebservice[i].diagnostico+"</td>"+
                "</tr>");
        }
        datatableAgraviados=$('#tabla_datos').DataTable({
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
                { "width": "35%" },
                { "width": "15%"},
                { "width": "15%" },
                { "width": "35%" }

            ]
        });
        $.fancybox.close();  

	}catch(err){
        emitirErrorCatch(err, "cargarTablaAgraviados"); // emite error
    }
}

/* @editarAgraviado: Abre una ventana donde se carga la informacion del agraviado seleccionado para editarlo.
*/
function editarAgraviado(){
	try{
		if(filaSeleccionada==undefined){
			fancyAlert("Por favor seleccione un agraviado");
		}else{
		    tipoAccion="E";
			abrirFancyBox(870, 320, "editaragraviado", true);	
		}
	}catch (err){
         emitirErrorCatch(err, "editarAgraviado"); // emite error
    }
}

/* @nuevoAgraviado: Abre una ventana para registrar un nuevo agraviado
*/
function nuevoAgraviado(){
    try{
        tipoAccion="N";
        abrirFancyBox(870, 320, "editaragraviado", true);
    }catch(err){
        emitirErrorCatch(err, "nuevoAgraviado");
    }
}