var dataTableTareas;
cargarInicio(function(){
	buscarTareasXnotificacion();
	labelTextWebPlus("id_Titulo", "NOTIFICACIÓN Nº "+LPAD(parent.window.frames[0].codNotificacion, numeroLPAD));
});
function buscarTareasXnotificacion(){
	try{
		fancyAlertWait("Cargando");
		var parametros="&idNotificacion="+parent.window.frames[0].codNotificacion;
		webService2("getTareasByNotificacion", parametros, "cargarTareas()");

	}catch(err){
		emitirErrorCatch(err, "buscarTareasXnotificacion"); // emite error
	}
}
function cargarTareas(){
	try{		
		if(dataTableTareas!=undefined){
            dataTableTareas.destroy();
            $('#tabla_datos > tbody').html("");
        }
        arrayLocalRegistros=rptaWebservice;
        var resultado;
        for(var i=0; i<rptaWebservice.length; i++){
        	resultado=rptaWebservice[i].resultado;
        	if(resultado==null){
        		resultado="";
        	}
            $("#tabla_datos > tbody").append("<tr style='height:30px; font-size:11.5px; font-family:Arial; cursor:pointer;' >"+
                "<td style='vertical-align: middle; text-align:center;'>"+LPAD(rptaWebservice[i].idTarea, numeroLPAD)+"</td>"+
                "<td style='vertical-align: middle; '>"+rptaWebservice[i].descripcionTarea+"</td>"+
                "<td style='vertical-align: middle; text-align:center; '>"+fechaFormateada(rptaWebservice[i].fechaProgramada, true)+"</td>"+
                "<td style='vertical-align: middle; '>"+resultado+"</td>"+
                "</tr>");
        }
        dataTableTareas=$('#tabla_datos').DataTable({
            "searching": true,
            "paging": false,
            "scrollY":"355px",
            "pagingType": "simple",
            "info":     false,
            "lengthChange": false,
            "scrollCollapse": true,
            "language": {
                "search": "Buscar:",
                "lengthMenu": "Visualizar _MENU_ por pag.",
                "zeroRecords": "Ningun Resultado - Lo Sentimos :(",
                "info": "Pag _PAGE_ de _PAGES_",
                "infoEmpty": "No Disponible",
                "infoFiltered": "(Filtrado de _MAX_ registros)"
            },
            "order": [[ 2, "asc" ]],
            //"bSort": false,
            "columns": [
                { "width": "15%" },
                { "width": "30%" },
                { "width": "20%", "type":"date-eu" },
            	{ "width": "35%" }
            ],
            "fnDrawCallback": ""
        });
        $.fancybox.close();

	} catch(err){
		emitirErrorCatch(err, "cargarTareas");
	}
}