/**
 * Created by JEAN PIERRE on 13/07/2016.
 */
var DAO = new DAOWebServiceGeT("wbs_as-sini") // El nombre del web service del modulo AS-SINI es "wbs_as-sini";
var paginacion = new Paginacion(); // Instancia del plugin para la paginacion
var dataTable = undefined;
var arrayDatos;
cargarInicio(function(){
    $("#btnBuscar").click(function(){
        paginacion.reiniciarPaginacion();
        buscar();
    })
    $("#btnRevisar").click(revisarInforme);
    $("#btnProyectar").click(proyectarGastos);
    $("#fechaDesde").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:false, closeOnDateSelect:true});
    $("#fechaHasta").val(convertirAfechaString(new Date(), false));
    buscar();
})
function cleanDate(idInput){
    try{
        $("#"+idInput).val("");
    }catch(err){
        emitirErrorCatch(err, "cleanDate()")
    }
}
function buscar(){ //** Realiza la busqueda de eventos segun los filtros seleccionados : Cod Evento, Placa, CAT, Rango de Fechas
    try{
        // obtiene valores de filtros
        var codEvento = $("#codEvento").val();
        var placa = $("#placa").val();
        var cat = $("#cat").val();
        var fechaDesde = dateTimeFormat($("#fechaDesde").val());
        var fechaHasta = dateTimeFormat($("#fechaHasta").val());

        var parametros = "&codEvento="+codEvento+
            "&placa="+placa+
            "&cat="+cat+
            "&fechaDesde="+fechaDesde+
            "&fechaHasta="+fechaHasta;
        DAO.consultarWebServiceGet("getEventosProyeccion", parametros, listar, true, paginacion); // consulta y muestra los resultado. La funcion "listar" es el callback. Activa la paginacion
    }catch(err){
        emitirErrorCatch(err, "buscar");
    }
}
function listar(resultsData){ // Lista los resultados de la busqueda de los eventos en la grilla con su paginacion
    try{
        for(var i=0; i<resultsData.length; i++){
            resultsData[i].direccionBreve = resultsData[i].lugarAccidente.substring(0,35); // recorta la direccion a que solo se muestre 35 caracteres seguido de puntos suspensivos
            resultsData[i].fechaEvento = resultsData[i].fechaAccidente.substring(0,10);
            resultsData[i].placa = quitarEspaciosEnBlanco(resultsData[i].placa);

            if(getLenth(resultsData[i].lugarAccidente)>35){
                resultsData[i].direccionBreve=resultsData[i].direccionBreve+"....";
            }
            resultsData[i].asociado="";
            switch(resultsData[i].tipoPersona){
                case 'N':
                    resultsData[i].asociado=resultsData[i].nombreAsociado;
                    break;
                case 'J':
                    resultsData[i].asociado=resultsData[i].razonSocial;
                    break;
            }
			if(resultsData[i].informeCerrado=='S'){
                resultsData[i].estadoInforme = "Cerrado";
            }else{
                resultsData[i].estadoInforme = "Completo";
            }
        }
        arrayDatos = resultsData;
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'codEvento', alineacion:'center'},
			{campo:'estadoInforme', alineacion:'center'},
            {campo:'fechaEvento', alineacion:'center'},
            {campo:'placa', alineacion:'center'},
            {campo:'nroCAT', alineacion:'center'},
            {campo:'asociado', alineacion:'left'},
            {campo:'direccionBreve', alineacion:'left'}
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", resultsData, camposAmostrar, true, 12); // crea la tabla HTML
        var columns=[
            { "width": "8%"  },
            { "width": "7%"  },
            { "width": "9%", "type":"date-eu" },
            { "width": "8%"  },
            { "width": "8%"  },
            { "width": "30%" },
            { "width": "30%" }
        ];
        var orderByColumn=[0, "desc"];
        dataTable=parseDataTable("tabla_datos", columns, 300, orderByColumn, false, false, false, function(){
            if(resultsData.length>0){
                var numeroPaginas = resultsData[0].numeroPaginas;
                if(typeof numeroPaginas != "undefined"){
                    paginacion.cargarPaginacion(numeroPaginas, "pagination", paginacion, function(page){
                        paginacion.paginaActual=page;
                        buscar();
                    });
                }
            }else{
                paginacion.cargarPaginacion(0, "pagination"); // con el metodo cargarPaginacion se implementa la implementacion. Recibe parametros @1: numero de paginas, @2: id DIV de la Paginacion
            }
        });
        $.fancybox.close();
    }catch(err){
        emitirErrorCatch(err, "listar");
    }
}
function revisarInforme(){
    try{
        if(filaSeleccionada!=undefined){
            var codEvento = arrayDatos[filaSeleccionada].codEvento;
            var idInforme = arrayDatos[filaSeleccionada].idInforme;
            parent.abrirVentanaFancyBox(900, 415, "nuevo_editar_informe?accion=E&codEvento="+codEvento+"&idInforme="+idInforme+"&soloLectura=T", true, null,true);
        }else{
            fancyAlert("¡Debe seleccionar un evento!");
        }
    }catch(err){
        emitirErrorCatch(err, "revisarInforme")
    }
}
function proyectarGastos(){ // abre la ventana donde se muestra la lista de agraviados del evento seleccionado en la grilla
    try{
        if(filaSeleccionada!=undefined){
			var codEvento = arrayDatos[filaSeleccionada].codEvento;			
            parent.abrirVentanaFancyBox(700, 360, "provision_agraviados?codEvento="+codEvento, true);			
        }else{
            fancyAlert("¡Debe seleccionar un evento!");
        }
    }catch(err){
        emitirErrorCatch(err, "proyectarGastos")
    }
}