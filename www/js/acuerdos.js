cargarInicio(function(){
    $("#idEstado").bind("change", function(){
        cargarListaAcuerdos($(this).val());
    });// asigno evento al combobox de estado
	cargarListaAcuerdos();
    $("#idNuevoAcuerdo").click(nuevoAcuerdo);
    $("#idDeudaActual").click(deudaActual);
    $("#idCancelarDeuda").click(cancelarAcuerdo);
});
var dataTable;
var tipoAccion;
var arrayLocalRegistros=new Array();
var infoEventoSeleccionado;

/* @cargarListaAcuerdos: Busca y carga la lista de los acuerdos filtrandolos por su estado
*/
function cargarListaAcuerdos(estado){
	try{
        if(estado==undefined){
            estado="P"; // Pendientes
        }
        $("#idEstado").val(estado);
		if(estado!="P"){
            $("#idCancelarDeuda").css("display", "none");
        }else{
            $("#idCancelarDeuda").css("display", "block");
        }
        fancyAlertWait("Cargando");
        var parametros="&estado="+estado;
		webService2("getListaAcuerdos", parametros, "cargarTablaAcuerdos()");
	}catch(err){
		emitirErrorCatch(err, "cargarListaAcuerdos"); // emite error
	}
}

/* @cargarTablaAcuerdos: Carga los acuerdos en una TABLA HTML
*/
function cargarTablaAcuerdos(){
	try{
        // carga la tabla HTML
        if(dataTable!=undefined){
            dataTable.destroy();
            $('#tabla_datos > tbody').html("");
        }
        arrayLocalRegistros=rptaWebservice;
        for(var i=0; i<rptaWebservice.length; i++){
            var personaResponsable="LA DEUDA HA SIDO CONDONADA";
            if(parseFloat(rptaWebservice[i].deudaAcordada)>0){
                rptaWebservice[i].nombresAsociado=quitarEspaciosEnBlanco(rptaWebservice[i].nombresAsociado);
                rptaWebservice[i].nombresPropietario=quitarEspaciosEnBlanco(rptaWebservice[i].nombresPropietario);
                rptaWebservice[i].nombresChofer=quitarEspaciosEnBlanco(rptaWebservice[i].nombresChofer);
                rptaWebservice[i].nombresPagadorFinal=quitarEspaciosEnBlanco(rptaWebservice[i].nombresPagadorFinal);
                if(rptaWebservice[i].nombresAsociado!=""){
                    personaResponsable=rptaWebservice[i].nombresAsociado;
                }else{
                    if(rptaWebservice[i].nombresPropietario!="" ){
                        personaResponsable=rptaWebservice[i].nombresPropietario;
                    }else{
                        if(rptaWebservice[i].nombresChofer!=""){
                            personaResponsable=rptaWebservice[i].nombresChofer;
                        }else{
                            personaResponsable=rptaWebservice[i].nombresPagadorFinal;
                        }                        
                    }
                }
            }
            $("#tabla_datos > tbody").append("<tr id='tr_"+i+"' onclick='seleccionarFila("+'"'+i+'"'+")' style='height:30px; font-size:11.5px; font-family:Arial; cursor:pointer;' >"+
                "<td style='vertical-align: middle; text-align:center; '>"+LPAD(rptaWebservice[i].idAcuerdo, numeroLPAD)+"</td>"+
                "<td style='vertical-align: middle; text-align:center; '>"+rptaWebservice[i].codEvento+"</td>"+
                "<td style='vertical-align: middle; text-align:center; '>"+fechaFormateada(rptaWebservice[i].fechaAcuerdo, true)+"</td>"+
                "<td style='vertical-align: middle; '>"+rptaWebservice[i].descripcionEvento+"</td>"+
                "<td style='vertical-align: middle; '>"+personaResponsable+"</td>"+
                "<td style='vertical-align: middle; text-align:center; '>S/. "+rptaWebservice[i].deudaAcordada+"</td>"+
                "</tr>");
        }
        // activa plugin datables.js
        dataTable=$('#tabla_datos').DataTable({
            "searching": true,
            "paging": false,
            "scrollY":"330px",
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
            "order": [[ 1, "desc" ]],
            //"bSort": false,
            "columns": [
                { "width": "10%" },
                { "width": "10%" },
                { "width": "13%" },
                { "width": "27%" },
                { "width": "30%" },
                { "width": "10%" }
            ],
            "fnDrawCallback": ""
        });
        $('#tabla_datos').on("search.dt", function(){
	        borrarFilaSeleccionada();
	    });
        $.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "cargarTablaAcuerdos");
	}
}
function nuevoAcuerdo(){
    try{
        tipoAccion="N"; // N=Nuevo Acuerdo
        parent.abrirFancyBox(880, 880, "deudaactual", true);
    }catch(err){
        emitirErrorCatch(err, "nuevoAcuerdo");
    }
}
/* @deudaActual: Abre una ventana para establecer los gastos administrativos
*/
function deudaActual(){
    try{
        tipoAccion="D"; // D=Deuda Actual
        parent.abrirFancyBox(810, 880, "deudaactual", true);
    }catch(err){
        emitirErrorCatch(err, "deudaActual");
    }
}

/*@cancelarAcuerdo: Abre una ventana para cancelar o condonar un acuerdo que se haya selecciono previamente en la lista de Acuerdos.
*/
function cancelarAcuerdo(){
    try{
        if(filaSeleccionada==undefined){
            fancyAlert("Por favor seleccionar un Acuerdo");
        }else{
            tipoAccion="C"; // C=Cancelar acuerdo 
            parent.abrirFancyBox(880, 1050, "deudaactual", true);
        }
    }catch(err){
        emitirErrorCatch(err, "cancelarAcuerdo");
    }
}