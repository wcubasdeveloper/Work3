/**
 * Created by JP on 19/06/2015.
 */
var arrayDistritos=parent.arrayDistritos;
var arrayProvincias=parent.arrayProvincias;
var arrayDepartamentos=parent.arrayDepartamentos;
var DataTable;
cargarInicio(function(){
    cargarResponsables();
    $("#idGuardar").click(function(){
        guardarListaResponsables();
    });
    $("#idBtnAgregarResponsable").click(agregarResponsableFinal);
});
function buscarPersona(e){
    try{
            //var key = window.Event ? e.which : e.keyCode
            var key = e.charCode || e.keyCode;
            if(key==13){ // presiono enter
                var parametros="&nroDoc="+$("#nroDoc").val();
                consultarWebServiceGet("getPersonaByNroDoc", parametros, function(datos){
                    var idDistrito='';
                    var idProvincia='';
                    if(datos.length>0){
                        var nombre=datos[0].nombrePersona;
                        if(datos[0].tipoPersona=='J'){
                            nombre=datos[0].razonSocial;
                        }
                        $("#txtNombre").val(nombre);
                        $("#txtNombre").prop("disabled", true)
                        $("#direccion").val(datos[0].calle1);
                        $("#nro").val(datos[0].nro1);
                        $("#mzlote").val(datos[0].mzLote1);
                        $("#sector").val(datos[0].sector1);
                        $("#referencia").val(datos[0].referencia1);
                        $("#telef").val(datos[0].telefonoFijo);
                        $("#cel").val(datos[0].telefonoMovil);
                        $("#email").val(datos[0].email);
                        idProvincia=datos[0].idProvincia;
                        idDistrito=datos[0].idDistrito;
                        if(idProvincia==null){
                            idProvincia="P01";
                            idDistrito="";
                        }
                    }else{
                        // desbloquea
                        $("#txtNombre").val("");
                        $("#txtNombre").prop("disabled", false)
                        $("#direccion").val("");
                        $("#nro").val("");
                        $("#mzlote").val("");
                        $("#sector").val("");
                        $("#referencia").val("");
                        $("#telef").val("");
                        $("#cel").val("");
                        $("#email").val("");
                        idProvincia="P01";
                    }
                    /*$("#select_N").html("");
                    $("#select_N").append(new Option("Seleccione", ""));
                    for(var i=0; i<arrayDistritos.length; i++){
                        if(arrayDistritos[i].idProvincia==idProvincia){
                            $("#select_N").append(new Option(arrayDistritos[i].nombre, arrayDistritos[i].idDistrito))
                        }
                    }*/
                    cargarDistritos("N", idProvincia); // Carga la provincia
                    $("#select_N").val(idDistrito);
                    $.fancybox.close();
                }, "Buscando Persona");
            }        

    }catch(err){
        emitirErrorCatch(err, "buscarPersona")
    }
}
var idProvinciaSelect="";
function cargarProvinciasDep(prefijo, idProvincia){
    try{
        var item=$("#select_"+prefijo).val();
        if(item=='OTRP'){ //Otra Provincia
            idProvinciaSelect=idProvincia;
            abrirVentanaFancyBox(400, 220, "provdepa", true, function(data){
                if(data!=undefined){                   
                    var idProvincia=data[0].provincia;                    
                    cargarDistritos(prefijo, idProvincia);
                }else{ // No se completo
                    $("select_"+prefijo).val("");
                }
            });
        }        
    }catch(err){
        emitirErrorCatch(err, "cargarProvinciasDep");
    }
}
function cargarDistritos(prefijo, idProvincia){
    try{
        $("#select_"+prefijo).html("");
        $("#select_"+prefijo).append(new Option("Seleccione", ""));
        for(var i=0; i<arrayDistritos.length; i++){
            if(arrayDistritos[i].idProvincia==idProvincia){
                $("#select_"+prefijo).append(new Option(arrayDistritos[i].nombre, arrayDistritos[i].idDistrito))
            }
        }
        $("#select_"+prefijo).append("<option value='OTRP'>Otra Provincia</option>"); // OTRP=Otra Provincia
    }catch(err){
        emitirErrorCatch(err, "cargarDistritos")
    }
}
function cargarResponsables() {
    try{
        var temp_Destinatarios=parent.temp_Destinatarios;
        for(var i=0; i<temp_Destinatarios.length; i++){
            if(temp_Destinatarios[i].idPersona=='N' && temp_Destinatarios[i].seleccionado=='checked'){ // Nueva
                // deshabilitar checks y quita todos los responsables seleccionados
                $("#tabla_datos > tbody tr").each(function(){
                   tr=this;
                   $(tr).css("background-color", "transparent");  // caso contrario la vuelve al color anterior
                   desHabilitarCajasTexto(tr, true);
                   var check=$(tr).find("td").eq(0).find("input");
                   $(check).prop("disabled", true)
                   $(check).prop("checked", false)
                });
                var idTR="tr_"+i;                
                $("#tabla_datos > tbody").append("<tr id='"+idTR+"' style='background-color: yellow; height:30px; font-size:9.5px; font-family:Arial; cursor:pointer; font-weight: 700;' >"+
                "<td style='vertical-align: middle; text-align:center;'><input  checked type='checkbox' name='checkDestinatario' value='N' onchange='quitarResponsableFinal("+'"'+idTR+'"'+")'/></td>"+
                "<td style='vertical-align: middle; text-align:center;'><textarea id='txtNombre' style='font-family: Arial; width:100px; font-size: 9.5px; font-weight: 700;'>"+temp_Destinatarios[i].nombre+"</textarea>"+
                "<td style='vertical-align: middle; text-align:center;'>F</td>"+
                "<td style='vertical-align: middle; text-align:center;'><input id='nroDoc' onkeypress='buscarPersona(event)' type='text' value='"+temp_Destinatarios[i].doc+"' style='font-family: Arial; width:75px; font-size: 9.5px; font-weight: 700;'/></td>"+
                "<td style='vertical-align: middle; text-align: center;'><textarea id='direccion' style='font-family: Arial; width: 130px; font-size: 9.5px; font-weight: 700;'>"+temp_Destinatarios[i].direccion+"</textarea></td>"+
                "<td style='vertical-align: middle; text-align: center;'><input id='nro' type='text' value='"+temp_Destinatarios[i].nro+"' style='font-family: Arial; width:75px; font-size: 9.5px; font-weight: 700;'/></td>"+
                "<td style='vertical-align: middle; text-align: center;'><input id='mzlote' type='text' value='"+temp_Destinatarios[i].mzlote+"' style='font-family: Arial; width:75px; font-size: 9.5px; font-weight: 700;'/></td>"+
                "<td style='vertical-align: middle; text-align: center;'><input id='sector' type='text' value='"+temp_Destinatarios[i].sector+"' style='font-family: Arial; width:75px; font-size: 9.5px; font-weight: 700;'/></td>"+
                "<td style='vertical-align: middle; text-align: center;'><input id='referencia' type='text' value='"+temp_Destinatarios[i].referencia+"' style='font-family: Arial; width:75px; font-size: 9.5px; font-weight: 700;'/></td>"+
                "<td style='vertical-align: middle; text-align: center;'><select onchange='cargarProvinciasDep("+'"'+temp_Destinatarios[i].idPersona+'", "'+temp_Destinatarios[i].provincia+'"'+")' id='select_"+temp_Destinatarios[i].idPersona+"' style='font-family:Arial; font-size:9.5px; width:100px;'><option value=''>Seleccione</option></select></td>"+
                "<td style='vertical-align: middle; text-align: center;'><input id='telef' type='text' style='font-family: Arial; width:60px; font-size: 9.5px; font-weight: 700;' value='"+temp_Destinatarios[i].telef+"'></td>"+
                "<td style='vertical-align: middle; text-align: center;'><input id='cel' type='text' style='font-family: Arial; width:60px; font-size: 9.5px; font-weight: 700;' value='"+temp_Destinatarios[i].celular+"'></td>"+
                "<td style='vertical-align: middle; text-align: center;'><input id='email' type='text' style='font-family: Arial; width: 130px; font-size: 9.5px; font-weight: 700;' value='"+temp_Destinatarios[i].email+"'></td>"+
                "</tr>");
                $("#txtNombre").focus();
                $("#idBtnAgregarResponsable").css("display", "none");
            }else{
                if(temp_Destinatarios[i].idPersona!='N'){
                    var estadoCajasDeTexto="";
                    var background="";
                    if(temp_Destinatarios[i].seleccionado==""){ // No se selecciono
                        estadoCajasDeTexto="readonly";
                    }else{
                        background=" background-color: yellow; ";
                    }
                    $("#tabla_datos > tbody").append("<tr id='tr_" + i + "'  style='"+background+" height:30px; font-size:9.5px; font-family:Arial; cursor:pointer; font-weight: 700;' >"+
                        "<td style='vertical-align: middle; text-align:center;'><input type='checkbox' name='checkDestinatario' value='"+temp_Destinatarios[i].idPersona+"' "+temp_Destinatarios[i].seleccionado+" onchange='seleccionarResponsable(this)'/>"+
                        "<td style='vertical-align: middle;'>"+temp_Destinatarios[i].nombre+"</td>"+
                        "<td style='vertical-align: middle; text-align:center;'>"+temp_Destinatarios[i].tipoAbrev+"</td>"+
                        "<td style='vertical-align: middle; text-align:center;'><input type='text' value='"+temp_Destinatarios[i].doc+"' style='font-family: Arial; width:75px; font-size: 9.5px; font-weight: 700;' "+estadoCajasDeTexto+"/></td>"+
                        "<td style='vertical-align: middle; text-align: center;'><textarea style='font-family: Arial; width: 130px; font-size: 9.5px; font-weight: 700;' "+estadoCajasDeTexto+" >"+temp_Destinatarios[i].direccion+"</textarea></td>"+
                        "<td style='vertical-align: middle; text-align: center;'><input type='text' value='"+temp_Destinatarios[i].nro+"' style='font-family: Arial; width:75px; font-size: 9.5px; font-weight: 700;' "+estadoCajasDeTexto+"/></td>"+
                        "<td style='vertical-align: middle; text-align: center;'><input type='text' value='"+temp_Destinatarios[i].mzlote+"' style='font-family: Arial; width:75px; font-size: 9.5px; font-weight: 700;' "+estadoCajasDeTexto+"/></td>"+
                        "<td style='vertical-align: middle; text-align: center;'><input type='text' value='"+temp_Destinatarios[i].sector+"' style='font-family: Arial; width:75px; font-size: 9.5px; font-weight: 700;' "+estadoCajasDeTexto+"/></td>"+
                        "<td style='vertical-align: middle; text-align: center;'><input type='text' value='"+temp_Destinatarios[i].referencia+"' style='font-family: Arial; width:75px; font-size: 9.5px; font-weight: 700;' "+estadoCajasDeTexto+"/></td>"+
                        "<td style='vertical-align: middle; text-align: center;'><select onchange='cargarProvinciasDep("+'"'+temp_Destinatarios[i].idPersona+'", "'+temp_Destinatarios[i].provincia+'"'+")' id='select_"+temp_Destinatarios[i].idPersona+"' style='font-family:Arial; font-size:9.5px; width:100px;' "+estadoCajasDeTexto+"><option value=''>Seleccione</option></select></td>"+
                        "<td style='vertical-align: middle; text-align: center;'><input type='text' style='font-family: Arial; width:60px; font-size: 9.5px; font-weight: 700;' value='"+temp_Destinatarios[i].telef+"' "+estadoCajasDeTexto+"></td>"+
                        "<td style='vertical-align: middle; text-align: center;'><input type='text' style='font-family: Arial; width:60px; font-size: 9.5px; font-weight: 700;' value='"+temp_Destinatarios[i].celular+"' "+estadoCajasDeTexto+"></td>"+
                        "<td style='vertical-align: middle; text-align: center;'><input type='text' style='font-family: Arial; width: 130px; font-size: 9.5px; font-weight: 700;' value='"+temp_Destinatarios[i].email+"' "+estadoCajasDeTexto+"></td>"+
                        "</tr>");
                }                
            }
            // cargar la lista de distritos            
            cargarDistritos(temp_Destinatarios[i].idPersona, temp_Destinatarios[i].provincia);
            $("#select_"+temp_Destinatarios[i].idPersona).val(temp_Destinatarios[i].distrito);
        }
        DataTable = $('#tabla_datos').DataTable({
            "searching": false,
            "paging": false,
            "scrollY":"252px",
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
                { "width": "3%" },
                { "width": "15%" },
                { "width": "2%"},
                { "width": "8%"},
                { "width": "10%" },
                { "width": "8%" },
                { "width": "8%" },
                { "width": "8%" },
                { "width": "8%" },
                { "width": "10%" },
                { "width": "5%" },
                { "width": "5%" },
                { "width": "10%" }
            ]
        });
    }catch(err){
        emitirErrorCatch(err, "cargarResponsables");
    }
}
function seleccionarResponsable(object){
    try{
        var trSeleccionada=$(object).parents().get(1); // fila donde se encuentra el checkbox (<tr>)
        // verificamos si se ha seleccionado o no el checkbox
        if($(object).prop('checked')==true) { // se selecciono la opcion
            $(trSeleccionada).css("background-color", "yellow"); // pinta de amarillo la fila de la opcion seleccionada
            $(trSeleccionada).find("td").eq(3).find("input").focus(); // coloca foco en  direccion TXT
            desHabilitarCajasTexto(trSeleccionada, false);
        }else{
            $(trSeleccionada).css("background-color", "transparent");  // caso contrario la vuelve al color anterior
            desHabilitarCajasTexto(trSeleccionada, true);
        }
    }catch(err){
        emitirErrorCatch(err, "seleccionarResponsable");
    }
}
function desHabilitarCajasTexto(filaSeleccionada, estado){
    try{
        var elementos=$(filaSeleccionada).find("td")
        elementos.each(function(){
            //var input=$(this).find("input");
           var caja=$(this).children();
            caja.each(function(){
                $(this).prop("readonly", estado);
            })
            //input.prop("readonly", estado);
        });
    }catch(err){
        emitirErrorCatch(err, "desHabilitarCajasTexto");
    }
}
function guardarListaResponsables(){
    try{
        var cantidadSeleccionada=$("input[name='checkDestinatario']:checked").length;
        var guardarResponsables=true;
        if(cantidadSeleccionada>0){
            var cantFilas=$("#tabla_datos > tbody tr").length;
            if($("#txtNombre").val()!=undefined){ // existe un persona responsable final
                $("#tabla_datos > tbody tr").eq(cantFilas-1).each(
                    function(){
                        var inputNombreResponsableFinal=$(this).find("td").eq(1).find("textarea");
                        var nombreResponsableFinal=inputNombreResponsableFinal.val().trim();
                        var inputDNI=$(this).find("td").eq(3).find("input");
                        var dni=inputDNI.val().trim();
                        var inputDireccion=$(this).find("td").eq(4).find("textarea");
                        var direccion=inputDireccion.val().trim();                        
                        var inputNro=$(this).find("td").eq(5).find("input");
                        var nro=inputNro.val().trim();
                        var inputMZLOTE = $(this).find("td").eq(6).find("input");
                        var mzlote=inputMZLOTE.val().trim();
                        var inputSector = $(this).find("td").eq(7).find("input");
                        var sector = inputSector.val().trim();
                        var inputReferencia = $(this).find("td").eq(8).find("input");
                        var referencia= inputReferencia.val().trim();
                        // Pendiente distrito (9)
                        var selectDist=$(this).find("td").eq(9).find("Select");
                        var distritoSeleccionado=selectDist.val();
                        var inputTelef=$(this).find("td").eq(10).find("input");
                        var telef=inputTelef.val().trim();
                        var inputCelular=$(this).find("td").eq(11).find("input");
                        var celular=inputCelular.val().trim();
                        var inputEmail=$(this).find("td").eq(12).find("input");
                        var email=inputEmail.val().trim();
                        if(nombreResponsableFinal==""){
                            fancyAlertFunction("Debe de ingresar el Nombre del responsable", function(estado){
                                if(estado){
                                    inputNombreResponsableFinal.focus();
                                }
                            })                            
                            guardarResponsables=false;
                            return false;
                        }
                        if(dni==""){
                            fancyAlertFunction("Falta completar el campo Nro Doc", function(estado){
                                if(estado){
                                    inputDNI.focus();
                                }
                            });
                            guardarResponsables=false;
                            return false;                                
                        }
                        if(direccion==""){
                            fancyAlertFunction("Falta completar el nombre de la via", function(estado){
                                if(estado){
                                   inputDireccion.focus();
                               }
                            });
                            guardarResponsables=false;
                            return false;
                        }
                        if(nro=="" && mzlote=="" && sector==""){ // No se ingreso ni numero ni Mz lote
                            fancyAlertFunction("Debe de ingresar el número o Mz/lote o Sector del domicilio", function(estado){
                                if(estado){
                                    inputNro.focus();
                                }
                            })
                            guardarResponsables=false;
                            return false;
                        }
                        if(distritoSeleccionado==""){ // No se ingreso el distrito
                            fancyAlertFunction("Debe de ingresar el distrito del domicilio", function(estado){
                                if(estado){
                                    selectDist.focus();
                                }
                            })
                            guardarResponsables=false;
                            return false;
                        }
                        if(telef=="" && celular==""){
                            fancyAlertFunction("Debe de ingresar por lo menos un número telefonico de referencia", function(estado){
                                if(estado){
                                   inputTelef.focus();
                                }
                            })
                            guardarResponsables=false;
                            return false;
                        }
                        var index='';
                        for(var i=0; i<parent.temp_Destinatarios.length; i++){
                            if(parent.temp_Destinatarios[i].idPersona=='N'){
                                index=i;                                
                            }else{
                                parent.temp_Destinatarios[i].seleccionado=''; // quita la opcion de seleccionado
                            }
                        }
                        if(index==''){
                            index=parent.temp_Destinatarios.length;
                        }
                        // Busca la provincia del distrito
                        var idProvincia;
                        for(var x=0; x<arrayDistritos.length; x++){
                            if(arrayDistritos[x].idDistrito==distritoSeleccionado){
                                idProvincia=arrayDistritos[x].idProvincia;
                                break;
                            }
                        }
                        parent.temp_Destinatarios[index]={
                            idPersona:'N',
                            tipoAbrev:'F',
                            tipoResponsable:'Responsable Final',
                            nombre:nombreResponsableFinal,
                            doc:dni,
                            direccion:direccion,
                            nro:nro,
                            mzlote:mzlote,
                            sector:sector,
                            referencia:referencia,
                            distrito:distritoSeleccionado,
                            provincia:idProvincia,
                            telef:telef,
                            celular:celular,
                            email:email,
                            seleccionado:'checked'
                        };                   
                    }
                )
            }else{
                $("#tabla_datos > tbody tr").each(
                    function(){
                        var checkbox=$(this).find("td").eq(0).find("input");
                        var inputDNI=$(this).find("td").eq(3).find("input");
                        var dni=inputDNI.val();
                        var inputDireccion=$(this).find("td").eq(4).find("textarea");
                        var direccion=inputDireccion.val();
                        var inputNro=$(this).find("td").eq(5).find("input");
                        var nro=inputNro.val();
                        var inputMZLOTE = $(this).find("td").eq(6).find("input");
                        var mzlote=inputMZLOTE.val();
                        var inputSector = $(this).find("td").eq(7).find("input");
                        var sector = inputSector.val();
                        var inputReferencia = $(this).find("td").eq(8).find("input");
                        var referencia= inputReferencia.val();
                        // Pendiente distrito (9)
                        var selectDist=$(this).find("td").eq(9).find("Select");
                        var distritoSeleccionado=selectDist.val();
                        var inputTelef=$(this).find("td").eq(10).find("input");
                        var telef=inputTelef.val();
                        var inputCelular=$(this).find("td").eq(11).find("input");
                        var celular=inputCelular.val();
                        var inputEmail=$(this).find("td").eq(12).find("input");
                        var email=inputEmail.val();
                        var seleccionado="";
                        if(checkbox.prop("checked")==true){ // verifica si esta seleccionado
                            seleccionado="checked";
                            if(dni.trim()==""){
                                fancyAlertFunction("Falta completar el campo Nro Doc", function(estado){
                                    if(estado){
                                        inputDNI.focus();
                                    }
                                });
                                guardarResponsables=false;
                                return false;                                
                            }
                            if(direccion.trim()==""){
                                fancyAlertFunction("Falta completar el nombre de la via", function(estado){
                                    if(estado){
                                        inputDireccion.focus();
                                    }
                                });
                                guardarResponsables=false;
                                return false;
                            }
                            if(nro.trim()=="" && mzlote.trim()=="" && sector.trim()==""){ // No se ingreso ni numero ni Mz lote
                                fancyAlertFunction("Debe de ingresar el número o Mz/lote o Sector del domicilio", function(estado){
                                    if(estado){
                                        inputNro.focus();
                                    }
                                })
                                guardarResponsables=false;
                                return false;
                            }
                            if(distritoSeleccionado==""){ // No se ingreso el distrito
                                fancyAlertFunction("Debe de ingresar el distrito del domicilio", function(estado){
                                    if(estado){
                                        selectDist.focus();
                                    }
                                })
                                guardarResponsables=false;
                                return false;
                            }
                            if(telef.trim()=="" && celular.trim()==""){
                                fancyAlertFunction("Debe de ingresar por lo menos un número telefonico de referencia", function(estado){
                                    if(estado){
                                        inputTelef.focus();
                                    }
                                })
                                guardarResponsables=false;
                                return false;
                            }
                        }
                        // Busca la provincia del distrito
                        var idProvincia;
                        for(var x=0; x<arrayDistritos.length; x++){
                            if(arrayDistritos[x].idDistrito==distritoSeleccionado){
                                idProvincia=arrayDistritos[x].idProvincia;
                                break;
                            }
                        }
                        // obtener el id del responsable
                        var idPersonaResponsable=$(this).find("td").eq(0).find("input").val();
                        for(var i=0; i<parent.temp_Destinatarios.length; i++){
                            if(parent.temp_Destinatarios[i].idPersona==idPersonaResponsable){
                                parent.temp_Destinatarios[i].doc=dni;
                                parent.temp_Destinatarios[i].direccion=direccion;
                                parent.temp_Destinatarios[i].nro=nro;
                                parent.temp_Destinatarios[i].mzlote=mzlote;
                                parent.temp_Destinatarios[i].sector=sector;
                                parent.temp_Destinatarios[i].referencia=referencia;
                                parent.temp_Destinatarios[i].distrito=distritoSeleccionado;
                                parent.temp_Destinatarios[i].provincia=idProvincia;
                                parent.temp_Destinatarios[i].telef=telef;
                                parent.temp_Destinatarios[i].celular=celular;
                                parent.temp_Destinatarios[i].email=email;
                                parent.temp_Destinatarios[i].seleccionado=seleccionado;                                
                            }
                            if(parent.temp_Destinatarios[i].idPersona=='N'){ // Natural
                                parent.temp_Destinatarios[i].seleccionado='';
                            }
                        }
                    }
                );
            }           
            if(guardarResponsables){
                parent.$.fancybox.close();
            }
        }else{
            fancyAlert("Por favor, seleccionar al menos un responsable");
        }
    }catch(err){
        emitirErrorCatch(err, "guardarListaResponsables");
    }
}
function agregarResponsableFinal(){ // agrega responsable final
    try{
        // deshabilitar checks y quita todos los responsables seleccionados
        $("#tabla_datos > tbody tr").each(function(){
           tr=this;
           $(tr).css("background-color", "transparent");  // caso contrario la vuelve al color anterior
           desHabilitarCajasTexto(tr, true);
           var check=$(tr).find("td").eq(0).find("input");
           $(check).prop("disabled", true)
           $(check).prop("checked", false)
        });
        /*DataTable.destroy(); // quita formato datatable
        DataTable=null;*/
        var nombre='';
        var direc='';
        var telef='';
        var cel='';
        var email='';
        var doc='';
        var nro='';
        var mzlote='';
        var sector='';
        var referencia='';
        var distrito='';
        for(var i=0; i<parent.temp_Destinatarios.length; i++){ // busca si ya existe agregado un responsable final
            if(parent.temp_Destinatarios[i].idPersona=='N'){
                nombre=parent.temp_Destinatarios[i].nombre;
                direc=parent.temp_Destinatarios[i].direccion;
                telef=parent.temp_Destinatarios[i].telef;
                cel=parent.temp_Destinatarios[i].celular;
                email=parent.temp_Destinatarios[i].email;
                doc=parent.temp_Destinatarios[i].doc;
                nro=parent.temp_Destinatarios[i].nro;
                mzlote=parent.temp_Destinatarios[i].mzlote;
                sector=parent.temp_Destinatarios[i].sector;
                referencia=parent.temp_Destinatarios[i].referencia;
                distrito=parent.temp_Destinatarios[i].distrito;
                break;
            }
        }
        var provincia='P01';
        if(distrito!=''){
            // Busca la provincia del distrito
            for(var x=0; x<arrayDistritos.length; x++){
                if(arrayDistritos[x].idDistrito==distrito){
                    provincia=arrayDistritos[x].idProvincia;
                    break;
                }
            }
        }
        var idTR="tr_"+parent.temp_Destinatarios.length;
        $("#tabla_datos > tbody").append("<tr id='"+idTR+"' style='background-color: yellow; height:30px; font-size:9.5px; font-family:Arial; cursor:pointer; font-weight: 700;' >"+
            "<td style='vertical-align: middle; text-align:center;'><input  checked type='checkbox' name='checkDestinatario' value='N' onchange='quitarResponsableFinal("+'"'+idTR+'"'+")'/></td>"+
            "<td style='vertical-align: middle; text-align:center;'><textarea id='txtNombre' style='font-family: Arial; width:100px; font-size: 9.5px; font-weight: 700;'>"+nombre+"</textarea>"+
            "<td style='vertical-align: middle; text-align:center;'>F</td>"+
            "<td style='vertical-align: middle; text-align:center;'><input id='nroDoc' onkeypress='buscarPersona(event)' type='text' value='"+doc+"' style='font-family: Arial; width:75px; font-size: 9.5px; font-weight: 700;'/></td>"+
            "<td style='vertical-align: middle; text-align: center;'><textarea id='direccion' style='font-family: Arial; width: 130px; font-size: 9.5px; font-weight: 700;'>"+direc+"</textarea></td>"+
            "<td style='vertical-align: middle; text-align: center;'><input id='nro' type='text' value='"+nro+"' style='font-family: Arial; width:75px; font-size: 9.5px; font-weight: 700;'/></td>"+
            "<td style='vertical-align: middle; text-align: center;'><input id='mzlote' type='text' value='"+mzlote+"' style='font-family: Arial; width:75px; font-size: 9.5px; font-weight: 700;'/></td>"+
            "<td style='vertical-align: middle; text-align: center;'><input id='sector' type='text' value='"+sector+"' style='font-family: Arial; width:75px; font-size: 9.5px; font-weight: 700;'/></td>"+
            "<td style='vertical-align: middle; text-align: center;'><input id='referencia' type='text' value='"+referencia+"' style='font-family: Arial; width:75px; font-size: 9.5px; font-weight: 700;'/></td>"+
            "<td style='vertical-align: middle; text-align: center;'><select onchange='cargarProvinciasDep("+'"N", "'+provincia+'"'+")' id='select_N' style='font-family:Arial; font-size:9.5px; width:100px;'><option value=''>Seleccione</option></select></td>"+
            "<td style='vertical-align: middle; text-align: center;'><input id='telef' type='text' style='font-family: Arial; width:60px; font-size: 9.5px; font-weight: 700;' value='"+telef+"'></td>"+
            "<td style='vertical-align: middle; text-align: center;'><input id='cel' type='text' style='font-family: Arial; width:60px; font-size: 9.5px; font-weight: 700;' value='"+cel+"'></td>"+
            "<td style='vertical-align: middle; text-align: center;'><input id='email' type='text' style='font-family: Arial; width: 130px; font-size: 9.5px; font-weight: 700;' value='"+email+"'></td>"+
            "</tr>");
        $("#txtNombre").focus();
        $("#idBtnAgregarResponsable").css("display", "none");        
        // cargar la lista de distritos
        cargarDistritos("N", provincia);
        $("#select_N").val(distrito);    

    }catch(err){
        emitirErrorCatch(err, "agregarResponsableFinal");
    }
}
function quitarResponsableFinal(id){
    try{
        $("#"+id).remove();
        // habilita los checks anteriores
        $("#tabla_datos > tbody tr").each(function(){
           tr=this;
           $(tr).css("background-color", "transparent");  // caso contrario la vuelve al color anterior
           var check=$(tr).find("td").eq(0).find("input");
           $(check).prop("disabled", false)
           $(check).prop("checked", false)
           $("#idBtnAgregarResponsable").css("display", "block");
        });
    }catch(err){
        emitirErrorCatch(err, "quitarResponsableFinal")
    }
}