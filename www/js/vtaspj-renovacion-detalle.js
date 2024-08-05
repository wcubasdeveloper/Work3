/**
 * Created by JEAN PIERRE on 12/10/2017.
 */
var dataTable = undefined;
var arrayDatos = []
var idContrato=0;
var idContratoRenovacion=0;
var idEmpresaTransp;
var nroCuota = 0;
var totalCuotas = 0;
var accion; // E = Editar , R = Registrar renovacion
var DAOV = new DAOWebServiceGeT("wbs_ventas")
var DAOT = new DAOWebServiceGeT("wbs_tesoreria") // Modulo webService que contiene todos los queries MySQL
var idConcesionarioVtasCorp;
var detalleContrato;
cargarInicio(function() {
    idContrato = $_GET("idContrato")
    accion = $_GET('accion');
    nroCuota = parseInt($_GET("nroCuota"))
    idContratoRenovacion = $_GET("idContratoRenovacion")
    //Recupera idConcesionarioVentasCorp desde ConstantesGenerales >> muestra en combo
    DAOT.consultarWebServiceGet("consultarConstGlobales", "", function(datos) {
        idConcesionarioVtasCorp = datos[0].idConcesionarioVtasCorp;
        // carga la informacion del contrato con su ultima cuota:
        var parametros = "&idContrato="+idContrato+
            "&nroCuota="+nroCuota;
        DAOV.consultarWebServiceGet("getContratoDetalle", parametros, function(datos){
            detalleContrato = datos[0]
            idEmpresaTransp = detalleContrato.idEmpresaTransp;
            $("#txtFechaEmision").val(detalleContrato.fechaEmision)
            $("#txtVigContr_Inicio").val(detalleContrato.fechaVigenciaContr)
            $("#txtVigContr_Fin").val(detalleContrato.fechaVigenciaContrFin)
            var nombreEmpresa = detalleContrato.razonSocial
            if(detalleContrato.tipoPersona=='N'){
                nombreEmpresa = detalleContrato.nombreNaturalEmpresa
            }
            $("#txtRazonSocial").val(nombreEmpresa)
            $("#txtNResolucion").val(detalleContrato.nroResolucion)
            totalCuotas = detalleContrato.nCuotas;
            if(accion=="R"){
                // oculta el botom Imprimir:
                $("#btnImprimeCATs").css("display", "none");
                // incrementa en una unidad el nro de cuota:
                nroCuota = nroCuota+1;
            }
            $("#txtNCuotas").val(nroCuota+"/"+detalleContrato.nCuotas)
            // fecha inicio-fin de certificado
            var vigenciasCuota = calcularVigenciaCertificadoCuota(detalleContrato.fechaVigenciaCert, nroCuota-1, detalleContrato.nCuotas)
            $("#txtVigCAT_Inicio").val(convertirAfechaString(vigenciasCuota[0], false, false))
            $("#txtVigCAT_Fin").val(convertirAfechaString(vigenciasCuota[1], false, false))

            labelTextWYSG("wb_Text1", LPAD(detalleContrato.idContrato, numeroLPAD))
            // quita todos los certificados que hayan sido excluidos
            for(var i=0; i<detalleContrato.listaFlota.length; i++){
                if(detalleContrato.listaFlota[i].estado!='E'){
                    arrayDatos.push(detalleContrato.listaFlota[i])
                }
            }
            for(var i=0; i<arrayDatos.length; i++){
                arrayDatos[i].idDetalle=i;
                arrayDatos[i].nroOrden = i+1;
            }
            if(accion=='R'){
                // carga los certificados para cada vehiculo
                var parametros = "&idConcesionario="+idConcesionarioVtasCorp+"&NFlota="+arrayDatos.length;
                DAOT.consultarWebServiceGet("getCertificadosVtasCorp",parametros, function(results){
                    var cantCertificados=results.length;
                    if(cantCertificados<arrayDatos.length){
                        //No hay certificados para atender a toda la flota
                        fancyAlertFunction("¡Solo hay " +cantCertificados +" disponibles!! NO se puede continuar...", function(rpta){
                            if(rpta){
                            }
                        });
                    }else{
                        // carga la grilla de vehiculos y CATS:
                        for(var i=0; i<results.length; i++){
                            arrayDatos[i].editable=false;
                            if(arrayDatos[i].nCertificado==null){ // no fue asignado ningun certificado. Ha sido asignado recientemente
                                arrayDatos[i].editable = true;
                            }
                            arrayDatos[i].nCertificado=results[i].nCertificado
                            if(arrayDatos[i].precio==null){
                                arrayDatos[i].aporte=null;
                            }else{
                                arrayDatos[i].aporte = arrayDatos[i].precio - arrayDatos[i].prima
                            }
                        }
                        listar()
                        $("#btnGuardar").click(guardarCuota);
                        $("#btnEditarCAT").click(editarCAT);
                        $.fancybox.close();
                    }
                });
            }else{
                // carga la grilla de vehiculos y CATS:
                for(var i=0; i<arrayDatos.length; i++){
                    arrayDatos[i].editable=false;                                    
                    if(arrayDatos[i].cantidadDeUsoVehiculo==1){// recien se esta usando este vehiculo en el contrato
                        arrayDatos[i].editable = true;
                    }
                    arrayDatos[i].aporte = arrayDatos[i].precio - arrayDatos[i].prima

                }
                listar()
                $("#btnGuardar").click(guardarCuota);
                $("#btnImprimeCATs").click(imprimir);
                $("#btnEditarCAT").click(editarCAT);
                $.fancybox.close();

            }
        })
    });
})
function listar() { // crea la grilla con la paginacion usando "arrayDatos"
    try{
        var camposAmostrar = [ // asigna los campos a mostrar en la grilla
            {campo:'nroOrden'  , alineacion:'center'},
            {campo:'nCertificado'         , alineacion:'left'},
            {campo:'placa'         , alineacion:'center'},
            {campo:'marca'        , alineacion:'left'},
            {campo:'modelo'          , alineacion:'left'},
            {campo:'anno'         , alineacion:'center'},
            {campo:'clase'   , alineacion:'left'},
            {campo:'nroMotor', alineacion:'left'},
            {campo:'nroAsientos', alineacion:'center'},
            {campo:'precio', alineacion:'right'},
            {campo:'prima', alineacion:'right'},
            {campo:'aporte'        , alineacion:'right'}
        ];
        if(dataTable!=undefined){
            dataTable.destroy();
        }
        crearFilasHTML("tabla_datos", arrayDatos, camposAmostrar, true, 12); // crea la tabla HTML

        var columns=[
            { "width": "5%" },
            { "width": "10%"},
            { "width": "10%"},
            { "width": "10%"},
            { "width": "10%"},
            { "width": "5%" },
            { "width": "11%"},
            { "width": "10%"},
            { "width": "5%" },
            { "width": "8%" },
            { "width": "8%" },
            { "width": "8%" }
        ];
        var orderByColumn=[0, "asc"];
        dataTable=parseDataTable("tabla_datos", columns, 290, false, false, false, false);
    }catch(err){
        emitirErrorCatch(err, "listar()")
    }
}
function calcularVigenciaCertificadoCuota(fechaVigenciaCert, cuota, totalCuotas){
    try{
        var mdatec = fechaVigenciaCert.split("/");
        var dcInicio = new Date(mdatec[2], parseInt(mdatec[1])-1, mdatec[0]);
        dcInicio.setMonth(dcInicio.getMonth() + (12/totalCuotas)*cuota);

        var dcFin = new Date(mdatec[2], parseInt(mdatec[1])-1, mdatec[0]);
        dcFin.setMonth(dcFin.getMonth() + (12/totalCuotas)*(cuota+1));

        return [dcInicio, dcFin]
    }catch(err){
        emitirErrorCatch("calcularVigenciaCertificadoCuota()")
    }
}
function editarCAT(){
    try{
        if(filaSeleccionada!=undefined) {
            if(arrayDatos[filaSeleccionada].editable){
                var idDetalle = filaSeleccionada;
                var url_comando = "vtaspj-renovacion-editar-vehiculo?idDetalle=" + idDetalle;
                abrirVentanaFancyBox(550, 350, url_comando, true, function (rptaDatos) {
                    $("#tr_" + idDetalle).find("td").eq(2).html(rptaDatos[0].placa);
                    $("#tr_" + idDetalle).find("td").eq(3).html(rptaDatos[0].marca);
                    $("#tr_" + idDetalle).find("td").eq(4).html(rptaDatos[0].modelo);
                    $("#tr_" + idDetalle).find("td").eq(5).html(rptaDatos[0].anno);
                    $("#tr_" + idDetalle).find("td").eq(6).html(rptaDatos[0].clase);
                    $("#tr_" + idDetalle).find("td").eq(7).html(rptaDatos[0].nroMotor);
                    $("#tr_" + idDetalle).find("td").eq(8).html(rptaDatos[0].nroAsientos);
                    $("#tr_" + idDetalle).find("td").eq(9).html(rptaDatos[0].precio);
                    $("#tr_" + idDetalle).find("td").eq(10).html(rptaDatos[0].prima);
                    $("#tr_" + idDetalle).find("td").eq(11).html(rptaDatos[0].aporte);

                    for (var i = 0; i < arrayDatos.length; i++) {
                        if (arrayDatos[i].idDetalle == idDetalle) {
                            arrayDatos[i].placa = rptaDatos[0].placa;
                            arrayDatos[i].marca = rptaDatos[0].marca;
                            arrayDatos[i].modelo = rptaDatos[0].modelo;
                            arrayDatos[i].anno = rptaDatos[0].anno;
                            arrayDatos[i].clase = rptaDatos[0].clase;
                            arrayDatos[i].nroMotor = rptaDatos[0].nroMotor;
                            arrayDatos[i].nroAsientos = rptaDatos[0].nroAsientos;
                            arrayDatos[i].precio = rptaDatos[0].precio;
                            arrayDatos[i].idClase = rptaDatos[0].idClase;
                            arrayDatos[i].idUso = rptaDatos[0].idUso;
                            arrayDatos[i].idVehiculo = rptaDatos[0].idVehiculo;
                            arrayDatos[i].prima = rptaDatos[0].prima
                            arrayDatos[i].valorCuota = arrayDatos[i].precio/totalCuotas;
                            break;
                        }
                    }
                });
            }else{
                fancyAlert("¡No se puede editar este CAT porque, ya se ha establecido su precio y toda su informaciont!")
            }
        }else{
            fancyAlert("¡ Debe seleccionar un Certificado !");
        }
    }catch(err){
        emitirErrorCatch(err, "editarCAT()")
    }
}
function guardarCuota(){
    try{
        var proceder = true;
        for(var i=0; i<arrayDatos.length; i++){
            if(arrayDatos[i].precio==null){
                proceder=false;
                fancyAlert("¡Debe registrar el precio para el certificado Nro "+arrayDatos[i].nCertificado+"!")
                break;
            }
        }
        if(proceder){
            var mensaje = "¿Confirma proceder con el registro de la nueva cuota?";
            if(accion=='E'){
                mensaje="¿Desea proceder con la actualización de la cuota?";
            }
            fancyConfirm(mensaje, function(rpta){
                if(rpta){
                    var totalCuota = 0;
                    // calcula el total de los precios de los certificados
                    for(var i=0; i<arrayDatos.length; i++){
                        totalCuota = totalCuota + arrayDatos[i].valorCuota;
                    }
                    var datosJSON = {
                        generales:{
                            idContrato:idContrato,
                            fechaRenovacion:dateTimeFormat($("#txtVigCAT_Inicio").val()),
                            flotaActual:arrayDatos.length,
                            nroCuota:nroCuota,
                            totalCuota:totalCuota,
                            idEmpresaTransp:idEmpresaTransp
                        },
                        datosFlota:arrayDatos
                    }
                    if(accion=="R"){// Regista la renovacion
                        DAOV.consultarWebServicePOST(datosJSON, "guardarRenovacion", function(data){
                            if(data.length>0){
                                var idContratoRenovacion = data[0]
                                fancyAlertFunction("¡Registro correcto ("+idContratoRenovacion+")!", function(rpta){
                                    realizoTarea=true;
                                    parent.$.fancybox.close();
                                })
                            }else{
                                fancyAlert("Fallo al registrar la renovación!")
                            }
                        })
                    }else{ // Edita la cuota
                        DAOV.consultarWebServicePOST(datosJSON, "actualizarCuota", function(data){
                            var filasAfectadas = data[0]
                            if(filasAfectadas>0){
                                fancyAlertFunction("¡Se actualizó la cuota correctamente!", function(rpta){
                                    if(rpta){
                                        realizoTarea=true
                                        parent.$.fancybox.close();
                                    }
                                })
                            }else{
                                fancyAlert("¡Operacion Fallida!")
                            }
                        })
                    }
                }
            })
        }
    }catch(err){
        emitirErrorCatch(err, "guardarCuota()")
    }
}
function imprimir(){
    try{
        var fechaRenovacion = dateTimeFormat($("#txtVigCAT_Inicio").val())
        detalleContrato.fechaRenovacion = fechaRenovacion
        detalleContrato.idConcesionario = idConcesionarioVtasCorp
        detalleContrato.idUsuarioUpdate=parent.idUsuario
        detalleContrato.fechaEmision=dateTimeFormat(convertirAfechaString(new Date()))
        detalleContrato.nroCuota = nroCuota;
        detalleContrato.idContrato = idContrato;
        var datosJSON = detalleContrato
        DAOV.consultarWebServicePOST(datosJSON, "imprimirCuota", function(data){
            var filasAfectadas = data[0]
            if(filasAfectadas>0){
                fancyAlertFunction("¡Operación Exitosa!", function(rpta){
                    if(rpta){
                        // genera el excel
                        window.open("wbs_ventas?funcion=reporteContratoExcel&idContrato="+idContrato+"&nroCuota="+nroCuota,'_blank');
                        realizoTarea=true
                        parent.$.fancybox.close();
                    }
                })
            }else{
                fancyAlert("¡Operacion Fallida!")
            }
        })
    }catch(err){
        emitirErrorCatch(err, "imprimir()")
    }
}