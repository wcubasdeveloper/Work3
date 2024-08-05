/**
 * Created by Jean on 09/07/2015.
 */
cargarInicio(cargarCronograma); // carga de inicio

/* @cargarCronograma: Genera el cronograma de pagos en una tabla HTML
*/
function cargarCronograma(){ // carga las cuotas
    try{
        var listaCuotas=parent.arrayCuotasCronograma; // obtiene las cuotas generadas
        for(var i=0; i<listaCuotas.length; i++){ // agrega la cuota en la tabla HTML
            $("#tabla_datos > tbody").append("<tr style='height:30px; font-size:11.5px; font-family:Arial; font-weight: 500;'>" +
                "<td style='text-align: center; vertical-align: middle;'>"+listaCuotas[i].nroCuota+"</td>"+
                "<td style='text-align: center; vertical-align: middle;'>"+listaCuotas[i].fecha+"</td>"+
                "<td style='text-align: center; vertical-align: middle;'>S/. "+listaCuotas[i].monto+"</td>"+
                "</tr>");
        }
        $('#tabla_datos').DataTable({ // agrega plugin de datables a la tabla creada
            "searching": false,
            "paging": false,
            "scrollY":"341px",
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
            //"order": [[ 0, "desc" ]],
            "bSort": false,
            "columns": [
                { "width": "25%" },
                { "width": "30%" },
                { "width": "45%"}
            ]
        });
        $("#idBtnDescargar").click(descargarCronograma);
    }catch(err){
        emitirErrorCatch(err, "cargarCronograma")
    }
}

/*@descargarCronograma: Genera la descarga del Cronograma en un archivo EXCEL.
*/
function descargarCronograma(){
    try{
        fancyAlertWait("Espere");
        var contentHTML=$("#divTABLA").html();
        nombreExcel="Cronograma Excel";
        generarExcelConJqueryYhtml(contentHTML, nombreExcel);
        $.fancybox.close();
    }catch(err){
        emitirErrorCatch(err, "descargarCronograma")
    }
}