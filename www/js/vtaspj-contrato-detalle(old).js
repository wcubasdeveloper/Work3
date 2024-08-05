 /**
 * Ingreso y edicion de detalles de un Contrato de Venta de certificados a Empresas de Transporte
 */
var DAOT = new DAOWebServiceGeT("wbs_tesoreria") // Modulo webService que contiene todos los queries MySQL
var DAOV = new DAOWebServiceGeT("wbs_ventas") // Objeto del web service de Ventas
var accion; // E=Editar Informe / N=Nuevo Informe
var idContrato,idConcesionarioVtasCorp,totalPrecios=0;
var paginacion = new Paginacion(); // Instancia del plugin para la paginacion de la grilla
var dataTable = undefined;
var arrayDatos = [],contadorIdCATs= 0,realizoCambio=false,camposAmostrar=[],FlotaActual=0;
 cargarInicio(function(){
     accion = $_GET('accion');
     idContrato = $_GET("idContrato");
     //Recupera idConcesionarioVentasCorp desde ConstantesGenerales >> muestra en combo

     DAOT.consultarWebServiceGet("consultarConstGlobales", "", function(datos) {
         idConcesionarioVtasCorp = datos[0].idConcesionarioVtasCorp;
         var parametros = "&idLocal=0";
         DAOV.consultarWebServiceGet("getAllConcesionarios", parametros, function(data){
             var campos =  {"keyId":'idConcesionario', "keyValue":'nombreCompuesto'}
             agregarOpcionesToCombo("cmbConcesionarios", data, campos);
             $("#cmbConcesionarios").val(idConcesionarioVtasCorp);
             $("#cmbConcesionarios").select2();
         });
     });
     //Asigna funciones a botones de interfase
     $("#cmbConcesionarios").change(cambioConcesionario);
     $("#btnBuscarPersona").click(buscarEmpresa);
     $("#btnBuscarRepLegal").click(buscarRepLegal);
     $("#idBtnBuscarPlaca").click(buscarVehiculo);
     $("#btnGuardar").click(guardarContrato);
     $("#btnImprimirCAT").click(impresionCATS);
     $("#btnEditCAT").click(editarCAT);
     $("#ui-id-4").parent().click(validaFlota);
    //Habilita campos fecha y actualizacion automatica
     $("#txtFechaEmision").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:true, closeOnDateSelect:false, step:15});
     $("#txtVigContr_Inicio").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:true, closeOnDateSelect:false, step:15});
     $("#txtVigContr_Inicio").change(function(){ //Calcular fecha final (+ 1 año)
        if($("#txtVigContr_Inicio").val()!=""){
            var mdate = $("#txtVigContr_Inicio").val().split("/");
            var d = new Date(mdate[2], parseInt(mdate[1])-1, mdate[0], 0, 0,0,0);
            d.setYear(d.getFullYear()+1); // fecha Inicio + 1 año = fechaFin
            $("#txtVigContr_Fin").val(convertirAfechaString(d, false, false));
        }
     });
     $("#txtVigCert_Inicio").datetimepicker({lan:'es', format:'d/m/Y',  timepicker:true, closeOnDateSelect:false, step:15});
     $("#txtVigCert_Inicio").attr("requerido", "Inicio Vigencia Certificados");
     $("#txtVigCert_Inicio").change(function(){ //Calcular fecha final (+ 1 periodo = 12meses/NCuotas)
         if ($("#txtNCuotas").val()>0) {
             if($("#txtVigContr_Inicio").val()!=""){
                 var mdate = $("#txtVigCert_Inicio").val().split("/");
                 var d1 = new Date(mdate[2], parseInt(mdate[1])-1, mdate[0]);
                 d1.setMonth(d1.getMonth() + 12/parseInt($("#txtNCuotas").val()));
                 $("#txtVigCert_Fin").val(convertirAfechaString(d1, false, false));
             }
         }else{
             fancyAlertFunction("¡Debe ingresar el Nro de Cuotas primero!", function(rpta){
                 if(rpta){
                     $("#txtNCuotas").focus();
                     return;
                 }
             });
         }
     });
    // Permite ingresar solo numeros
     $("#txtDNI").addClass("solo-numero");
     $("#txtNCuotas").addClass("solo-numero");
     $("#txtFlota").addClass("solo-numero");
     $("#txtFlota").change(validaNFlota);
     $("#txtTel").addClass("solo-numero");
     $("#txtDNIRep").addClass("solo-numero");
     $("#txtTelRep").addClass("solo-numero");
     $(".solo-numero").keypress(function(e){
         return textNumber(e);
        });
     // Cargar distritos
     DAOV.consultarWebServiceGet("getAllDistritos", "", function(data) {
         arrayDistritos = data; // Guarda los distritos
         DAOV.consultarWebServiceGet("getAllProvincias", "", function (datos) {
             arrayProvincias = datos;
             DAOV.consultarWebServiceGet("getAllDepartamentos", "", function (depas) {
                 arrayDepartamentos = depas;
                 $("#idDistrito_emp").change(function () {
                     cargarProvinciasDep('emp', idProvinciaSelect);  //variable Global
                     if(accion=="N"){

                     }else{
                        //Recuperar datos desde Contrato, Contrato_Certificados, Contrato_Renovacion
                     }
                 })
                 $.fancybox.close();
             });
         });
     });
 });
 //
 function cambioConcesionario(){
     //actualizar variable global
 }
function validaNFlota(){
    if (FlotaActual>0){
        var r = confirm("Ha cambiado el tamano de la flota, se perderá la información de los vehiculos ingresados. ¿ Esta seguro?");
        if (r == true) {
            arrayDatos = [];
        } else {
            $("#txtFlota").focus();
        }
    }
}
 function validaFlota(){
 // Click DATOS DE FLOTA: Valida que se haya definido el Tamano de flota y Nro de cuotas previamente.
     var NFlota=parseInt($("#txtFlota").val());
     if(NFlota==0 || $("#txtNCuotas").val()==""  ){
         fancyAlertFunction("¡Debe ingresar el Nro de Cuotas y el tamaño de flota!", function(rpta){
             if(rpta){
                 $("#ui-id-1").click();
                 $("#txtFlota").focus();
             }
         });
     } else {//ubicar tantos certificados disponibles como NFlota y agregar al arrayDatos

          if( FlotaActual!=NFlota) { //ya hay datos
             var parametros = "&idConcesionario="+idConcesionarioVtasCorp+"&NFlota="+NFlota;
             DAOT.consultarWebServiceGet("getCertificadosVtasCorp",parametros, function(results){
                 arrayDatos = results; //guarda pagina actual en variable global
                 var cantCertificados=results.length;
                 if(cantCertificados<NFlota){
                     //No hay certificados para atender a toda la flota
                     fancyAlertFunction("¡Solo hay " +cantCertificados +" disponibles!! NO se puede continuar...", function(rpta){
                         if(rpta){
                             $("#ui-id-1").click();
                             $("#txtFlota").focus();
                             return;
                         }
                     });
                 }
                 //agrega propiedades extras
                 for(var i=0;i<results.length;i++){
                     results[i].idDetalle=i; //identificador de Linea Detalle
                     results[i].placa="";
                     results[i].marca="";
                     results[i].modelo="";
                     results[i].anno="";
                     results[i].clase="";
                     results[i].nroMotor="";
                     results[i].nroAsientos=0;
                     results[i].idVehiculo=0;
                     results[i].precio=0.0;
                     results[i].aporte=0.0;
                     results[i].fondo=0.0;
                 }
                 listar(); // muestra los certificados disponibles encontrados
                 actualizarTotales();
                 FlotaActual=NFlota;
             });
          }

     }
 }
 function listar(){ // crea la grilla con la paginacion usando "arrayDatos"
     try{
         //estado, idContrato, fechaEmision, nombreCorto, nCuotas, flota, fechaIniVigencia, fechaFinVigencia

         camposAmostrar = [ // asigna los campos a mostrar en la grilla
             {campo:'nCertificado'  , alineacion:'left'           },
             {campo:'placa'         , alineacion:'left'           },
             {campo:'marca'         , alineacion:'left'           },
             {campo:'modelo'        , alineacion:'left'           },
             {campo:'anno'          , alineacion:'left'           },
             {campo:'clase'         , alineacion:'left'           },
             {campo:'nroMotor'      , alineacion:'left'           },
             {campo:'nroAsientos'   , alineacion:'center'           },
             {campo:'precio'        , alineacion:'right'           },
             {campo:'aporte'        , alineacion:'right'           },
             {campo:'fondo'         , alineacion:'right'           }
         ];
         if(dataTable!=undefined){
             dataTable.destroy();
         }
         crearFilasHTML("tabla_datos", arrayDatos, camposAmostrar, true, 12); // crea la tabla HTML
         var columns=[
             { "width": "10%"   },
             { "width": "10%"   },
             { "width": "10%"   },
             { "width": "10%"   },
             { "width": "5%"    },
             { "width": "10%"   },
             { "width": "10%"   },
             { "width": "5%"    },
             { "width": "10%"   },
             { "width": "10%"   },
             { "width": "10%"   }
         ];
         var orderByColumn=[0, "asc"];
         dataTable=parseDataTable("tabla_datos", columns, 295, orderByColumn, false, false, false, function(){
             if(arrayDatos.length>0){
                 var numeroPaginas = arrayDatos[0].numeroPaginas;
                 if(typeof numeroPaginas != "undefined"){
                     paginacion.cargarPaginacion(numeroPaginas, "pagination", paginacion, function(page){
                         paginacion.paginaActual=page;
                         buscar();
                     });
                 }
             }else{
                 paginacion.cargarPaginacion(0, "pagination");
                 // Recibe parametros @1: numero de paginas, @2: id DIV de la Paginacion
             }
         });
         $.fancybox.close();
     }catch(err){
         emitirErrorCatch(err, "listarCertificados")
     }
 }
 function actualizarTotales(){
     try{
         totalPrecios = 0;
         for(var i=0; i<arrayDatos.length; i++){
             totalPrecios += parseFloat(arrayDatos[i].precio);
         }
         $("#txtTotalPrecio").val(formatDec(totalPrecios,"S/.",1));
         $("#txtTotalAporte").val(formatDec(totalPrecios*0.8,"S/.",1));
         $("#txtTotalFondo").val(formatDec(totalPrecios*0.2,"S/.",1));
     }catch(err){
         emitirErrorCatch(err, "actualizarTotales");
     }
 }
 function editarCAT(){
     try{
         if(filaSeleccionada!=undefined){
             var idDetalle = filaSeleccionada;
             var url_comando="vtaspj-contrato-editar-vehiculo?idDetalle="+idDetalle;
             abrirVentanaFancyBox(550, 350, url_comando, true, function(rptaDatos){
                 var idDetalle = rptaDatos[0].idDetalle;
/*
 idDetalle : idDetalle,
 placa:$("#txtPlaca").val(),
 idUso: $("#cmbUsoVehiculo").val(),
 uso: $("#cmbUsoVehiculo :selected").text(),
 idClase:$("#cmbClaseVehiculo").val(),
 clase: $("#cmbClaseVehiculo :selected").text(),
 marca:$("#txtMarca").val(),
 modelo:$("#txtModelo").val(),
 anno:$("#txtAnno").val(),
 nroMotor:$("#txtSerieNro").val(),
 nroAsientos:$("#txtAsientos").val(),
 idVehiculo:midVehiculo,
 precio:$("#txtPrecio").val(),
 aporte:0.8*parseInt($("#txtPrecio").val()),
 fondo:0.2*parseInt($("#txtPrecio").val())
 */
                 $("#tr_" + idDetalle).find("td").eq(0).html(rptaDatos[0].nCertificado);
                 $("#tr_" + idDetalle).find("td").eq(1).html(rptaDatos[0].placa);
                 $("#tr_" + idDetalle).find("td").eq(2).html(rptaDatos[0].marca);
                 $("#tr_" + idDetalle).find("td").eq(3).html(rptaDatos[0].modelo);
                 $("#tr_" + idDetalle).find("td").eq(4).html(rptaDatos[0].anno);
                 $("#tr_" + idDetalle).find("td").eq(5).html(rptaDatos[0].clase);
                 $("#tr_" + idDetalle).find("td").eq(6).html(rptaDatos[0].nroMotor);
                 $("#tr_" + idDetalle).find("td").eq(7).html(rptaDatos[0].nroAsientos);
                 $("#tr_" + idDetalle).find("td").eq(8).html(rptaDatos[0].precio);
                 $("#tr_" + idDetalle).find("td").eq(9).html(rptaDatos[0].aporte);
                 $("#tr_" + idDetalle).find("td").eq(10).html(rptaDatos[0].fondo);

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
                         break;
                     }
                 }
                 actualizarTotales();
                 realizoCambio = true;
             });
         }else{
             fancyAlert("¡ Debe seleccionar un Certificado !");
         }
     }catch(err){
         emitirErrorCatch(err, "editarCAT")
     }
 }
 // busqueda una Persona por su DNI
 function buscarEmpresa(){
     try{
         var tipoP= $("#cmbTipoPersona").val();
         var numeroDigitos=11,tipoDoc="RUC"; //default persona Juridica
         if(tipoP=='N'){
             tipoDoc = "DNI";
             numeroDigitos=8;
         }
         var DNI = $("#txtDNI").val();
         var cantidadDigitos = DNI.split("").length;
         if(cantidadDigitos == numeroDigitos){
             var parametros = "&nroDoc="+DNI;
             DAOT.consultarWebServiceGet("getEmpresaTranspByNroDoc", parametros, function(data){
                 cargarResultEmpr(data);
                 $.fancybox.close();
             });
         }else{
             fancyAlertFunction("¡ Formato de "+tipoDoc+" incorrecto !", function(rpta){
                 if(rpta){
                     $("#idDNI").focus();
                 }
             })
         }
     }catch(err){
         emitirErrorCatch(err, "buscarEmpresa");
     }
 }
 // carga los resultados de la busqueda de una persona x su DNI
 var idEmpresaTransp=0,idPersonaEmpTransp=0,idPersonaRepLegal=0;
 function cargarResultEmpr(data){
     try{
         var idDistritoAsociado = null;
         var tipoP = $("#cmbTipoPersona").val(); // N = Natural / J=Juridico
         $("#txtDNI").attr("idPersona", "0");
         if(data.length>0){ // encontro a la persona que se buscaba
             idDistritoAsociado = data[0].idDistrito;
             if(data[0].tipoPersona=='N'){
                 $("#txtNombres").val(data[0].nombres);
                 $("#txtApePat").val(data[0].apellidoPaterno);
                 $("#txtApeMat").val(data[0].apellidoMaterno);
             }else{ // Juridico
                 $("#txtRazonSocial").val(data[0].razonSocial);
             }
             $("#txtTel").val(data[0].telefonoMovil);
             $("#txtDirec").val(data[0].calle);
             $("#txtEmail").val(data[0].email);
             idPersonaEmpTransp= data[0].idPersona;
             if(data[0].datosEmpresa.length>0){
                 //La persona esta registrada como Empresa Transporte
                 $("#txtNResolucion").val(data[0].datosEmpresa[0].nroResolucion);
                 idEmpresaTransp=data[0].datosEmpresa[0].idEmpresaTransp;
                 idPersonaRepLegal=data[0].datosEmpresa[0].idRepLegal;
                 //OjO buscar datos de Representante Legal
             }
         }
         $("#cmbTipoPersona").prop("disabled", true);
         $("#txtDNI").prop("disabled", true);
         if(tipoP=='N'){
             $("#txtNombres").prop("disabled", false);
             $("#txtApePat").prop("disabled", false);
             $("#txtApeMat").prop("disabled", false);
             $("#txtNombres").focus();

             $("#txtNombres").attr("requerido", "Nombres del Asociado");
             $("#txtApePat").attr("requerido", "Apellido Paterno del Asociado");
             $("#txtApeMat").attr("requerido", "Apellido Materno del Asociado");
             $("#txtRazonSocial").attr("requerido", "");
         }else{// Juridica
             $("#txtRazonSocial").prop("disabled", false);
             $("#txtRazonSocial").focus();

             $("#txtNombres").attr("requerido", "");
             $("#txtApeMat").attr("requerido", "");
             $("#txtApePat").attr("requerido", "");
             $("#txtRazonSocial").attr("requerido", "Razon Social del Asociado");
         }

         $("#txtTel").prop("disabled", false);
         $("#idDistrito_emp").prop("disabled", false);
         $("#txtDirec").prop("disabled", false);
         $("#txtEmail").prop("disabled", false);
         $("#txtNResolucion").prop("disabled", false);
         cargarDistritoEmpresa(idDistritoAsociado);
        //Cambia funcionalidad de boton >> puede cambiar de Persona a traves de su DNI
         $("#btnBuscarPersona").unbind("click");
         $("#btnBuscarPersona").attr("onclick", "");
         //$("#btnBuscarPersona_"+tipoPersona).val("Cambiar");
         $("#btnBuscarPersona").prop("class", "glyphicon glyphicon-minus-sign");
         $("#btnBuscarPersona").click(function(){
             cambiarDNI();
         });

     }catch(err){
         emitirErrorCatch(err, "cargarResultPersona");
     }
 }
  // cargar Distrito
 function cargarDistritoEmpresa(idDistrito){
     try{
         var idProvincia="P01";
         if(idDistrito!=null){
             for(var i=0; i<arrayDistritos.length; i++){
                 if(arrayDistritos[i].idDistrito==idDistrito){
                     idProvincia=arrayDistritos[i].idProvincia;
                     break;
                 }
             }

         }
         idProvinciaSelect = idProvincia;
         cargarDistritos('emp',idProvincia);
         if(idDistrito!=null) {
             $("#idDistrito_emp").val(idDistrito);
             $("#idDistrito_emp").select2();
         }
     }catch(err){
         emitirErrorCatch(err, "cargarDistritoAsociado");
     }
 }
 // realiza el cambio de DNI
 function cambiarDNI(){
     try{
         //Limpia los campos de la poliza y reincia los valores de busqueda
         idPersonaEmpTransp = 0;
         $("#txtDNI").val("");
         $("#txtNombres").val("");
         $("#txtApePat").val("");
         $("#txtApeMat").val("");
         $("#txtRazonSocial").val("");
         $("#txtTel").val("");
         $("#idDistrito_emp").val("");
         $("#idDistrito_emp").select2();
         labelTextWYSG("wb_label_emp", "(...)");
         $("#txtDirec").val("");
         $("#txtEmail").val("");
         $("#txtNResolucion").val("");

         $("#txtNombres").attr("requerido", "");
         $("#txtApeMat").attr("requerido", "");
         $("#txtApePat").attr("requerido", "");
         $("#txtRazonSocial").attr("requerido", "");
         $("#txtNResolucion").attr("requerido", "");

         $("#cmbTipoPersona").prop("disabled", false);
         $("#txtDNI").prop("disabled", false);
         $("#txtNombres").prop("disabled", true);
         $("#txtApePat").prop("disabled", true);
         $("#txtApeMat").prop("disabled", true);
         $("#txtRazonSocial").prop("disabled", true);
         $("#txtTel").prop("disabled", true);
         $("#idDistrito_emp").prop("disabled", true);
         $("#txtDirec").prop("disabled", true);

         $("#btnBuscarPersona").unbind("click");
         $("#btnBuscarPersona").attr("onclick", "");
         $("#btnBuscarPersona").prop("class", "glyphicon glyphicon-search");
         $("#btnBuscarPersona").click(function(){
             buscarEmpresa();
         });
         $("#txtDNI").focus();
     }catch(err){
         emitirErrorCatch(err, "cambiarDNI");
     }
 }

 function buscarRepLegal(){
     try{

         var DNI = $("#txtDNIRep").val();
         var cantidadDigitos = DNI.split("").length;
         if(cantidadDigitos == 8){
             var parametros = "&nroDoc="+DNI;

             DAOV.consultarWebServiceGet("getPersonaByNroDoc", parametros, function(data){
                 cargarResultRepLegal(data);
                 $.fancybox.close();
             });
         }else{
             fancyAlertFunction("¡ Formato de DNI incorrecto !", function(rpta){
                 if(rpta){
                     $("#idDNIRep").focus();
                 }
             })
         }
     }catch(err){
         emitirErrorCatch(err, "buscarEmpresa");
     }
 }
 function cargarResultRepLegal(data){
     try{
         var idDistritoAsociado = null;
         /*
          [idPersona, tipoPersona, nombrePersona, nombres, apellidoPaterno, apellidoMaterno,
          razonSocial, nroDocumento, calle, nro, mzLote, sector, referencia, d.idDistrito,
          d1.idDistrito as distritoInicial, d.idProvincia,  calle1, nro1, mzLote1, sector1, referencia1,
          telefonoFijo, telefonoMovil, email from Persona p
          */
         if(data.length>0){ // encontro a la persona que se buscaba
             idDistritoAsociado = data[0].distritoInicial;
             $("#txtNombreRep").val(data[0].nombres);
             $("#txtApePatRep").val(data[0].apellidoPaterno);
             $("#txtApeMatRep").val(data[0].apellidoMaterno);
             $("#txtTelfRep").val(data[0].telefonoMovil);
             $("#txtDirecRep").val(data[0].calle);
             idPersonaRepLegal= data[0].idPersona;
         }
         $("#txtDNIRep").prop("disabled", true);
             $("#txtNombreRep").prop("disabled", false);
             $("#txtApePatRep").prop("disabled", false);
             $("#txtApeMatRep").prop("disabled", false);
             $("#txtNombreRep").focus();

             $("#txtNombreRep").attr("requerido", "Nombres RepLegal");
             $("#txtApePatRep").attr("requerido", "Apellido Pat RepLegal");
             $("#txtApeMatRep").attr("requerido", "Apellido Mat RepLegal");

         $("#txtTelfRep").prop("disabled", false);
         $("#idDistrito_rep").prop("disabled", false);
         $("#txtDirecRep").prop("disabled", false);
         cargarDistritoRepLegal(idDistritoAsociado);
         //Cambia funcionalidad de boton >> puede cambiar de Persona a traves de su DNI
         $("#btnBuscarRepLegal").unbind("click");
         $("#btnBuscarRepLegal").attr("onclick", "");
         $("#btnBuscarRepLegal").prop("class", "glyphicon glyphicon-minus-sign");
         $("#btnBuscarRepLegal").click(function(){
             cambiarDNI1();
         });

     }catch(err){
         emitirErrorCatch(err, "cargarResultRepLegal");
     }
 }
 function cargarDistritoRepLegal(idDistrito){
     try{
         var idProvincia="P01";
         if(idDistrito!=null){
             for(var i=0; i<arrayDistritos.length; i++){
                 if(arrayDistritos[i].idDistrito==idDistrito){
                     idProvincia=arrayDistritos[i].idProvincia;
                     break;
                 }
             }
         }
         idProvinciaSelect1 = idProvincia; //puntero alterno
         cargarDistritos('rep',idProvincia);
         if(idDistrito!=null) {
             $("#idDistrito_rep").val(idDistrito);
             $("#idDistrito_rep").select2();
         }
     }catch(err){
         emitirErrorCatch(err, "cargarDistritoRepLegal");
     }
 }
 function cambiarDNI1(){
     try{
         //Limpia los campos del Rep. Legal
         idPersonaRepLegal=0;
         $("#txtNombreRep").val("");
         $("#txtApePatRep").val("");
         $("#txtApeMatRep").val("");
         $("#txtTelfRep").val("");
         $("#idDistrito_rep").val("");
         $("#idDistrito_rep").select2();
         labelTextWYSG("wb_label_rep", "(...)");
         $("#txtDirecRep").val("");

         $("#txtNombreRep").attr("requerido", "");
         $("#txtApeMatRep").attr("requerido", "");
         $("#txtApePatRep").attr("requerido", "");

         $("#txtDNIRep").prop("disabled", false);
         $("#txtNombreRep").prop("disabled", true);
         $("#txtApePatRep").prop("disabled", true);
         $("#txtApeMatRep").prop("disabled", true);
         $("#txtTelfRep").prop("disabled", true);
         $("#idDistrito_rep").prop("disabled", true);
         $("#txtDirecRep").prop("disabled", true);

         $("#btnBuscarRepLegal").unbind("click");
         $("#btnBuscarRepLegal").attr("onclick", "");
         $("#btnBuscarRepLegal").prop("class", "glyphicon glyphicon-search");
         $("#btnBuscarRepLegal").click(function(){
             buscarRepLegal();
         });
         $("#txtDNIRep").focus();
     }catch(err){
         emitirErrorCatch(err, "cambiarDNI1");
     }
 }
 // realiza la busqueda de un vehiculo por su placa
 function buscarVehiculo(){
     try{
         var placa = $("#txtPlaca").val().trim();
         if(placa==""){
             fancyAlertFunction("¡Ingrese la placa correctamente!", function(){
                 $("#txtPlaca").focus();
             })
             return;
         }
         var parametros = "&placa="+placa;
         DAOV.consultarWebServiceGet("buscarPlaca", parametros, function(data){
             if(data.length>0){
                 //completa la informacion del vehiculo
                 $("#cmbUsoVehiculo").val(data[0].idUso)
                 $("#cmbUsoVehiculo").change();
                 $("#cmbClaseVehiculo").val(data[0].idClase)
                 $("#cmbClaseVehiculo").change();
                 $("#txtMarca").val(data[0].marca)
                 $("#txtModelo").val(data[0].modelo);
                 $("#txtAnno").val(data[0].anno)
                 $("#txtSerieNro").val(data[0].nroSerieMotor)
                 $("#txtAsientos").val(data[0].nroAsientos)
                 $("#txtPlaca").attr("idVehiculo", data[0].idVehiculo)
             }
             // habilita los campos bloqueados:
             $("#cmbUsoVehiculo").prop("disabled", false);
             $("#cmbClaseVehiculo").prop("disabled", false);
             $("#txtMarca").prop("disabled", false);
             $("#txtModelo").prop("disabled", false);
             $("#txtAnno").prop("disabled", false);
             $("#txtSerieNro").prop("disabled", false);
             $("#txtAsientos").prop("disabled", false);

             // desactiva el campo placa
             $("#txtPlaca").prop("disabled", true);
             $("#idBtnBuscarPlaca").unbind("click");
             $("#idBtnBuscarPlaca").prop("class","glyphicon glyphicon-minus-sign");
             $("#idBtnBuscarPlaca").click(reiniciarBusquedaVehiculo);
             $.fancybox.close();
         });
     }catch(err){
         emitirErrorCatch(err, "buscarVehiculo");
     }
 }
function crearObjectoPersona(flagPersona, objetoData){
	try{
		$("#idDNI_"+flagPersona).val(objetoData['DNI_'+flagPersona]);
		return 	[{
				idPersona: objetoData['idPersona_'+flagPersona],
				nombres: objetoData['nombres_'+flagPersona],
				apellidoPaterno: objetoData['apellidoPaterno_'+flagPersona],
				apellidoMaterno: objetoData['apellidoMaterno_'+flagPersona]
			}]
	}catch(err){
		emitirErrorCatch(err, "crearObjectoPersona");
	}
}
function clickPestaña(pestaña){
    try{
        if(pestaña!="" || pestaña!=undefined){
            var menuTotal=$("#jQueryTabs1").find("ul").eq(0).find("li");
            menuTotal.each(function(){
                var li_Actual=$(this);
                var href_Actual=li_Actual.find("a").eq(0);
                var spanMenu=href_Actual.find("span").eq(0);
                var nombreMenu=spanMenu.html();
                if(nombreMenu==pestaña){
                    href_Actual.click();
                }
            });
        }
    }catch(err){
        emitirErrorCatch(err, "clickPestaña")
    }
}

function verificaDNIValidado(flag){
    try{
        return $("#idDNI_"+flag).prop("disabled");
    }catch(err){
        emitirErrorCatch(err, "verificaDNIValidado")
    }
}
function informePDF(){
	try{
		window.open("wbs_as-sini?funcion=informeProcuradorPDF&idInforme="+idInforme+"&codEvento="+codEvento, '_blank');				
	}catch(err){
		emitirErrorCatch(err, "PDF");
	}
}
//------------------------------------------------------------
 function guardarContrato(){

 }
 function impresionCATS(){

 }

