var datatableAcuerdos=undefined;
var arrayData=new Array(); // contiene todos los resultados

/* @cargarAcuerdo: Envia la informacion del acuerdo seleccionado, para que se carge despues de cerrar la ventana de Busqueda.
*/
function cargarAcuerdo(){
    try{
        if(filaSeleccionada!=undefined){
            rptaCallback[0]=arrayData[filaSeleccionada];
            realizoTarea=true;
            parent.$.fancybox.close();
        }else{
            fancyAlert("Por favor seleccione un acuerdo");
        }
    }catch(err){
        emitirErrorCatch(err, "cargarAcuerdo")
    }
}
/* @listarAcuerdos: Lista los acuerdos que se buscaron previamente.
*/
function listarAcuerdos(data){
    try{
        arrayData=data;
        var dataTemp=new Array();
        for(var i=0; i<data.length; i++){
            dataTemp[i]=data[i];
            dataTemp[i].deudaAcordada="S/. "+parseFloat(dataTemp[i].deudaAcordada).toFixed(2);
            dataTemp[i].cuotaInicial = "S/."+parseFloat(dataTemp[i].cuotaInicial).toFixed(2);
			switch (data[i].tipoPersona){
                case 'N':
                    dataTemp[i].asociado=data[i].nombreAsociado.trim();
                    break;
                case 'J':
                    dataTemp[i].asociado=data[i].razonSocial.trim();
                    break;
            }
        }
        var CampoAlineacionArray=[
            {campo:'idAcuerdo', alineacion:'center', LPAD:true},
            {campo:'codEvento', alineacion:'center'},
            {campo:'fechaAcuerdo', alineacion:'center'},
            {campo:'deudaAcordada', alineacion:'center'},
            {campo:'fechaInicioCuotas', alineacion:'center'},
            {campo:'asociado', alineacion:'justify'},
            {campo:'nroCAT', alineacion:'center'},
            {campo:'placa', alineacion:'center'}];
        if(datatableAcuerdos!=undefined){
            datatableAcuerdos.destroy(); // elimina
        }
        crearFilasHTML("tabla_datos", dataTemp, CampoAlineacionArray, true);
        // Asignamos dataTables a la tabla ya creada
        var arrayColumnWidth=[
            { "width": "8%"},
            { "width": "12%"},
            { "width": "10%", "type":"date-eu"},
            { "width": "10%"},
            { "width": "10%", "type":"date-eu"},
            { "width": "30%"},
            { "width": "10%"},
            { "width": "10%"}
        ];
        var orderByColum=[2, "desc"];
        datatableAcuerdos=parseDataTable("tabla_datos", arrayColumnWidth, 210, orderByColum, false, true);
        $("#oculta").css("display", "none");
        $.fancybox.close();
    }catch(err){
        emitirErrorCatch(err, "listarAcuerdos")
    }
}
/* @buscarAcuerdo: Realiza la busqueda de los acuerdo en la Base de datos, por el Nro. de Acuerdo, Cod. Evento, Nro. CAT, Placa, DNI del responsable y Fecha de registro del acuerdo.
*/
function buscarAcuerdo() {
    try{
        if($("input:checked").length>0){ // identifica que se haya seleccionado un tipo de busqueda
            var tipoBusqueda=$("input[type='radio'][name='busqueda']:checked").val();
            var parametros="&tipoBusqueda="+tipoBusqueda; // parametros que se envian para el web service
            var idPanel; // id del Panel activo
            if(tipoBusqueda=='F'){ // si la busqueda se hace por fechas, se enviara los campos fecha de inicio y fin
                idPanel="buscar_x_fechas";
                if(validarCamposRequeridos(idPanel)){ // valida campos requeridos del panel activo identificado
                    var fechaFin=$("#fin").val();
                    if(fechaFin!=""){ // si se inserto una fecha fin, validara que la fecha de fin no sea menor o igual que la fecha de inicio
                        var fechaInicial=$("#inicio").val()
                        fechaInicial=parseDATE(fechaInicial)
                        fechaFin=parseDATE(fechaFin)
                        if(fechaFin<=fechaInicial){
                            fancyAlertFunction("La Fecha Final debe ser mayor que la fecha de Inicio", function(estado){
                                if(estado){
                                    $("#fin").focus()
                                }
                            });
                            return;
                        }
                    }
                    parametros+="&fechaInicio="+dateTimeFormat($("#inicio").val())+
                        "&fechaFin="+dateTimeFormat($("#fin").val());
                }
            }else{
                idPanel="buscar_x_codigo";
                if(validarCamposRequeridos(idPanel)){ // valida campos requeridos del panel activo identificado
                    parametros+="&codigo="+$("#codigo").val();
                    
                }else{
                    return;
                }
            }
            consultarWebServiceGet("buscarAcuerdos", parametros, listarAcuerdos, "Buscando");
        }else{
            fancyAlert("Debe seleccionar un tipo de Busqueda")
        }
    }catch(err){
        emitirErrorCatch(err, "buscarAcuerdo")
    }
}
/**
 * Created by Jean on 13/07/2015.
 */
cargarInicio(function(){
    $("#inicio").datetimepicker({lan:'es', format:'d/m/Y', timepicker:false, closeOnDateSelect:true});// agrega plugin datetimepicker a cajas de textos
    $("#fin").datetimepicker({lan:'es', format:'d/m/Y', maxDate:0,  timepicker:false, closeOnDateSelect:true});
    $("#fin").val(fechaFormateada((new Date()), false, true))
    $("input[type='radio'][name='busqueda']").change( // agrega funcion change a radio
        function(){
            try{
                $("#panel_busqueda").css("display", "block"); // Muestra el panel de busqueda (Panel q contiene a los paneles (De fechas y de Codigo))
                var tipoBusqueda=$("input[type='radio'][name='busqueda']:checked").val(); // obtiene el valor del radio seleccionado
                if(tipoBusqueda=='F'){ // si el tipo de busqueda es por fechas => Se mostrara el panel de fechas
                    $("#buscar_x_codigo").css("display", "none"); // oculta el panel de codigo
                    $("#buscar_x_fechas").css("display", "block"); // muestra el panel de fechas
                    $("#inicio").focus();
                }else{ // sino se mostrará el panel de busqueda x codigo
                    $("#buscar_x_fechas").css("display", "none"); // oculta el panel de fechas
                    $("#buscar_x_codigo").css("display", "block"); // Muestra el panel de codigo
                    $("#codigo").focus();
                }
            }catch(err){
                emitirErrorCatch(err, "funcion change radio busqueda");
            }
        }
    );
    $("#btnBuscarAcuerdo").click(buscarAcuerdo); // asigna evento onclick para buscar acuerdo
    $("#idBtnSeleccionar").click(cargarAcuerdo);
	if(codEventoSeleccionado!=""){
		$('input[name=busqueda][value=E]').attr("checked", "checked");
		$('input[name=busqueda][value=E]').change();
		$('#codigo').val(codEventoSeleccionado);
	}
});