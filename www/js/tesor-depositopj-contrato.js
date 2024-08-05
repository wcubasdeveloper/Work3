var DAO = new DAOWebServiceGeT("wbs_tesoreria")
var midContratoRenovacion = $_GET("idContratoRenovacion");
var arrayDatos = [];

cargarInicio(function(){
    aplicarDataTable();
    var parametros = "&idContratoRenovacion="+midContratoRenovacion;
    DAO.consultarWebServiceGet("getContratoRenovacion", parametros, function(datos){
        // idContrato, InicioContr, nCuotas, nroCuota, idEmpresaTransp, nombreEmpresa, InicioCATS, FinCATS,
        // flotaActual, totalCuota
        $("#txtIDContrato").val(LPAD(datos[0].idContrato,numeroLPAD));
        $("#txtNombreEmpr").val(datos[0].nombreEmpresa);
        $("#txtInicioContr").val(datos[0].InicioContr);
        $("#txtNCuotas").val(datos[0].nCuotas);
        $("#txtNroCuota").val(datos[0].nroCuota);
        $("#txtInicioCATS").val(datos[0].InicioCATS);
        $("#txtFinCATS").val(datos[0].FinCATS);
        $("#txtNFlota").val(datos[0].flotaActual);
        $("#txtTotal").val("S/."+datos[0].totalCuota);
        var rptaDatos = datos[0].detalleContr;
        for(var i=0; i<rptaDatos.length; i++){
            //[nroCertificado,placa,nombreClase,marca,modelo,anno,nroSerieMotor,precio]
            rptaDatos[i].aporte = rptaDatos[i].precio*0.8;
            rptaDatos[i].fondo = rptaDatos[i].precio*0.2;
            var trFila = "<tr id='tr_"+rptaDatos[i].idDetalle+"' style='font-family: Arial; height: 30px; " +
                "cursor: pointer; font-size: 12px;' onclick='seleccionarFila("+'"'+rptaDatos[i].idDetalle+'"'+")'>"+
                "<td style='text-align:left;'>"+rptaDatos[i].nroCertificado+"</td>"+
                "<td style='text-align:left;'>"+rptaDatos[i].placa+"</td>"+
                "<td style='text-align:left;'>"+rptaDatos[i].nombreClase+"</td>"+
                "<td style='text-align:left;'>"+rptaDatos[i].marca+"</td>"+
                "<td style='text-align:left;'>"+rptaDatos[i].modelo+"</td>"+
                "<td style='text-align:left;'>"+rptaDatos[i].anno+"</td>"+
                "<td style='text-align:left;'>"+rptaDatos[i].nroSerieMotor+"</td>"+
                "<td style='text-align:left;'>"+rptaDatos[i].precio+"</td>"+
                "<td style='text-align:left;'>"+rptaDatos[i].aporte+"</td>"+
                "<td style='text-align:left;'>"+rptaDatos[i].fondo+"</td>"+
            "</tr>";
            arrayDatos.push(rptaDatos[i]);
            $("#tabla_datos > tbody").append(trFila);
        }
        $(":input").prop("disabled", true); // bloque todas las entradas (input text, radio, select)
        $(":input").css("opacity", "0.65");
        $.fancybox.close();
    });
});
function aplicarDataTable(){
	try{
/*
 "<td style='text-align:left;'>"+rptaDatos[i].nroCAT+"</td>"+
 "<td style='text-align:left;'>"+rptaDatos[i].placa+"</td>"+
 "<td style='text-align:left;'>"+rptaDatos[i].nombreClase+"</td>"+
 "<td style='text-align:left;'>"+rptaDatos[i].marca+"</td>"+
 "<td style='text-align:left;'>"+rptaDatos[i].modelo+"</td>"+
 "<td style='text-align:left;'>"+rptaDatos[i].anno+"</td>"+
 "<td style='text-align:left;'>"+rptaDatos[i].nroSerieMotor+"</td>"+
 "<td style='text-align:left;'>"+rptaDatos[i].precio+"</td>"+
 "<td style='text-align:left;'>"+rptaDatos[i].aporte+"</td>"+
 "<td style='text-align:left;'>"+rptaDatos[i].fondo+"</td>"+
 */
		var camposAmostrar = [ // asigna los campos a mostrar en la grilla
			{campo:'nroCAT',        alineacion:'left'},
			{campo:'placa',         alineacion:'left'},
			{campo:'nombreClase',   alineacion:'left'},
			{campo:'marca',         alineacion:'left'},
			{campo:'modelo',        alineacion:'left'},
            {campo:'anno',          alineacion:'left'},
            {campo:'nroSerieMotor', alineacion:'left'},
            {campo:'precio',        alineacion:'left'},
            {campo:'aporte',        alineacion:'left'},
            {campo:'aporte',        alineacion:'left'}
		];
		var columns=[
			{"width": "10%"},
			{"width": "10%"},
			{"width": "10%"},
			{"width": "10%"},
            {"width": "10%"},
            {"width": "10%"},
            {"width": "10%"},
            {"width": "10%"},
            {"width": "10%"},
			{"width": "10%"}
		];
		crearFilasHTML("tabla_datos", arrayDatos, camposAmostrar, true, 12); // crea la tabla HTML
		parseDataTable("tabla_datos", columns, 300, false, false, false, false, function(){
            if($("#tabla_datos > tbody >tr").length==1 && $("#tabla_datos > tbody >tr")[0].innerText=='NO SE ENCONTRARON REGISTROS'){
                $("#tabla_datos > tbody").html("");
            }
		});		
		$.fancybox.close();
	}catch(err){
		emitirErrorCatch(err, "aplicarDataTable");
	}
}

