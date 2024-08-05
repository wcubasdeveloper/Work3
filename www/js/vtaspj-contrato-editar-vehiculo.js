var DAOT = new DAOWebServiceGeT("wbs_tesoreria") // Objeto webService que contiene todos los queries MySQL modulo Tesoreria
var DAOV = new DAOWebServiceGeT("wbs_ventas") // Objeto webservice de Ventas
var idDetalle = $_GET("idDetalle"); //Numerador de items de Detalle
var realizoCambio=false, cargaInicial=true;
var midVehiculo=0, midClase=0,midUso=0,mPrecio=0;  //valores originales
var lista_Usos = [],lista_Clases = [];
cargarInicio(function(){
    $("#btnGuardar").click(guardarDetalle);
    $("#idBtnBuscarPlaca").click(buscarVehiculo);
    var parametros = "";
    DAOV.consultarWebServiceGet("getAllUsos", "", function(data1){     // obtiene la lista de los usos y sus clases:
        lista_Usos = data1; // guarda la informacion de los usos
        DAOV.consultarWebServiceGet("getAllClasesXuso", "", function(data2){
            lista_Clases = data2;
            var campos = {"keyId":"idUso", "keyValue":"nombreUso"};
            agregarOpcionesToCombo("cmbUsoVehiculo", lista_Usos, campos);
            $("#cmbUsoVehiculo").change(function(){
                var valorUso = $("#cmbUsoVehiculo").val();
                if(valorUso=="" || valorUso == undefined){
                    fancyAlertFunction("Debe seleccionar un USO apropiado", function(){
                        openSelect($("#cmbUsoVehiculo"));
                    })
                    $("#cmbClaseVehiculo").html("<option value=''>Seleccione</option>"); // reinicia el combobox de clases
                    return;
                }
                var lista_clase_mostar = [];
                for(var i = 0; i< lista_Clases.length; i++){
                    if(lista_Clases[i].idUso == valorUso){
                        lista_clase_mostar.push(lista_Clases[i]);
                    }
                }
                var campos_Clase = {"keyId":"idClase", "keyValue":"nombreClase"};
                agregarOpcionesToCombo("cmbClaseVehiculo", lista_clase_mostar, campos_Clase);
                openSelect($("#cmbClaseVehiculo"));
                realizoCambio = true;
            });
            $("#cmbClaseVehiculo").prop("disabled", true);
            $("#cmbUsoVehiculo").prop("disabled", true);
            $("#cmbClaseVehiculo").change(activarMonto);
            $("#txtMarca").prop("disabled", true);
            $("#txtModelo").prop("disabled", true);
            $("#txtAnno").prop("disabled", true);
            $("#txtAnno").attr("maxlength", "4");
            $("#txtAnno").addClass("solo-numero");
            $("#txtSerieNro").prop("disabled", true);
            $("#txtAsientos").prop("disabled", true);
            $("#txtAsientos").addClass("solo-numero");
            $("#txtPlaca").attr("requerido", "Placa");
            $("#txtPlaca").keyup(function(){
                convertMayusculas(this)
            });
            $("#cmbUsoVehiculo").attr("requerido", "Uso de Vehiculo");
            $("#cmbClaseVehiculo").attr("requerido", "Clase de Vehiculo");
            $("#txtMarca").attr("requerido", "");
            $("#txtModelo").attr("requerido", "");
            $("#txtAnno").attr("requerido", "");
            $("#txtSerieNro").attr("requerido", "Nro Serie Motor");
            $("#txtAsientos").attr("requerido", "Nro de Asientos del vehiculo");
            // Precio del certificado:
            $("#txtPrecio").addClass("solo-numero");
            $("#txtPrecio").prop("disabled", true)
            $("#txtPrecio").attr("requerido", "Monto Total");

            $("#txtMarca").change(modificoDato);
            $("#txtModelo").change(modificoDato);
            $("#txtAnno").change(modificoDato);
            $("#txtSerieNro").change(modificoDato);
            $("#txtAsientos").change(modificoDato);
            $("#txtPrecio").change(modificoDato);

            // Agrega campos de tipo entero:
            $(".solo-numero").keypress(function(e){ // permite ingresar solo numeros
                return textNumber(e);
            });
            // Siempre va a Editar
            var arrayDetalles = parent.arrayDatos;
            for(var i=0; i<arrayDetalles.length; i++){
                if(arrayDetalles[i].idDetalle == idDetalle){
                    $("#txtNCertificado").val(arrayDetalles[i].nCertificado);
                    if (arrayDetalles[i].placa != ""){
                        midVehiculo=arrayDetalles[i].idVehiculo; //variables seleccionadas anteriormente
                        midUso=arrayDetalles[i].idUso;
                        midClase=arrayDetalles[i].idClase;
                        mPrecio=arrayDetalles[i].precio;
                        $("#txtPlaca").val(arrayDetalles[i].placa);
                        $("#txtMarca").val(arrayDetalles[i].marca);
                        $("#txtModelo").val(arrayDetalles[i].modelo);
                        $("#txtAnno").val(arrayDetalles[i].anno);
                        $("#txtSerieNro").val(arrayDetalles[i].nroMotor);
                        $("#txtAsientos").val(arrayDetalles[i].nroAsientos);
                        $("#txtPrecio").val(arrayDetalles[i].precio);
                        $("#txtPrima").val(arrayDetalles[i].prima);
                        $("#cmbUsoVehiculo").val(midUso);
                        $("#cmbUsoVehiculo").change();
                        $("#cmbClaseVehiculo").val(midClase);
                        ActivaDatosVehiculo();
                        desactivaCampPlaca();
                    }
                    break;
                }
            }
            parent.$(".fancybox-close").unbind("click");
            parent.$(".fancybox-close").click(avisarCambiosEfectuados1);
            $.fancybox.close();
        });
    });
})
function modificoDato(){
    realizoCambio = true;
}
function avisarCambiosEfectuados1(){
    try{
        if(realizoCambio){
            fancyConfirm("¿Desea salir sin guardar los cambios?", function(rpta){
                if(rpta){
                    parent.$.fancybox.close(); // cierra la ventana
                }
            })
        }else{
            parent.$.fancybox.close();
        }
    }catch(err){
        emitirErrorCatch(err, "avisarCambiosEfectuados1()")
    }
}
function activarMonto(){
    try{
        var usoClase = $("#cmbClaseVehiculo").val();
        if(usoClase!=null && usoClase!=""){
            for(var i=0; i<lista_Clases.length; i++){
                if(lista_Clases[i].idClase == usoClase){
                    $("#txtPrima").val(lista_Clases[i].prima)
					$("#txtPrecio").val(lista_Clases[i].montoPoliza);
                    $("#txtPrecio").prop("disabled", false);
                    break;
                }
            }
        }else{
            $("#txtPrecio").val("");
        }
        realizoCambio = true;
    }catch(err){
        emitirErrorCatch(err, "activarMonto")
    }
}

function validarPLACA_noRepetida(){
    try{
        var mPlaca = $("#txtPlaca").val();
        var arrayDetalle = parent.arrayDatos;
        for(var i=0; i<arrayDetalle.length; i++){
            if(arrayDetalle[i].idDetalle!=idDetalle){
                if(arrayDetalle[i].placa == mPlaca){
                    fancyAlert("¡La PLACA Nro. "+arrayDetalle[i].placa+" ya se ha usado !!");
                    return false;
                }
            }
        }
        return true;
    }catch(err){
        emitirErrorCatch(err, "validarPLACA_noRepetida");
    }
}
function guardarDetalle(){
    try{
        if (realizoCambio){
            if(validarCamposRequeridos("idForm")){
                if(validarPLACA_noRepetida()){
                    var registro = {
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
                        aporte:parseFloat($("#txtPrecio").val())-parseFloat($("#txtPrima").val()),//0.8*parseInt($("#txtPrecio").val()),
                        fondo:0.2*parseInt($("#txtPrecio").val()),
                        prima:$("#txtPrima").val()
                        };
                    realizoTarea=true;      //devuelve dato en variable global (:MHBSoftScripts.js
                    rptaCallback = [registro];
                }
            }
            parent.$.fancybox.close(); //solo sale
        }
    }catch(err){
        emitirErrorCatch(err, "guardarDetalle")
    }
}
// realiza la busqueda de un vehiculo por su placa
function buscarVehiculo(){
	try{
		var placa = $("#txtPlaca").val().trim();
		if(placa==""){
            //alert("¡Debe ingresar el Nro de la Placa!"); //quitar href en tag "a"
            //$("#txtPlaca").focus();
            fancyAlertFunction("¡Debe ingresar el Nro de la Placa!", function(rpta){
                if(rpta){
                    $("#txtPlaca").focus();
                }
            });
		}else {
            realizoCambio=true;
            var parametros = "&placa="+placa;
            DAOV.consultarWebServiceGet("buscarPlaca", parametros, function(data){
                if(data.length>0){  //si existe, muestra la informacion del vehiculo
                    midVehiculo=data[0].idVehiculo;
                    $("#cmbUsoVehiculo").val(data[0].idUso)
                    $("#cmbUsoVehiculo").change();
                    $("#cmbClaseVehiculo").val(data[0].idClase)
                    $("#cmbClaseVehiculo").change();
                    $("#txtMarca").val(data[0].marca)
                    $("#txtModelo").val(data[0].modelo);
                    $("#txtAnno").val(data[0].anno)
                    $("#txtSerieNro").val(data[0].nroSerieMotor)
                    $("#txtAsientos").val(data[0].nroAsientos)
                }
                ActivaDatosVehiculo();
                desactivaCampPlaca();
                $.fancybox.close();
		});
        }
	}catch(err){
		emitirErrorCatch(err, "buscarVehiculo");
	}
}
function ActivaDatosVehiculo(){
    // habilita los campos bloqueados:
    $("#cmbUsoVehiculo").prop("disabled", false);
    $("#cmbClaseVehiculo").prop("disabled", false);
    $("#txtMarca").prop("disabled", false);
    $("#txtModelo").prop("disabled", false);
    $("#txtAnno").prop("disabled", false);
    $("#txtSerieNro").prop("disabled", false);
    $("#txtAsientos").prop("disabled", false);
    $("#txtPrecio").prop("disabled", false)

}
function desactivaCampPlaca(){
    // desactiva el campo placa
    $("#txtPlaca").prop("disabled", true);
    $("#idBtnBuscarPlaca").unbind("click");
    $("#idBtnBuscarPlaca").prop("class","glyphicon glyphicon-minus-sign");
    $("#idBtnBuscarPlaca").click(reiniciarBusquedaVehiculo);
}
function reiniciarBusquedaVehiculo(){
	try{
		
		$("#cmbClaseVehiculo").val("")
		$("#cmbUsoVehiculo").val("")		
		$("#txtMarca").val("")
		$("#txtModelo").val("")
		$("#txtAnno").val("")
		$("#txtSerieNro").val("")
		$("#txtAsientos").val("")
		
		$("#cmbClaseVehiculo").prop("disabled", true);
		$("#cmbUsoVehiculo").prop("disabled", true);	
		$("#txtMarca").prop("disabled", true);
		$("#txtModelo").prop("disabled", true);
		$("#txtAnno").prop("disabled", true);
		$("#txtSerieNro").prop("disabled", true);
		$("#txtAsientos").prop("disabled", true);
		
		$("#txtPlaca").val("");
		$("#txtPlaca").prop("disabled", false);
		$("#idBtnBuscarPlaca").unbind("click");
		$("#idBtnBuscarPlaca").prop("class", "glyphicon glyphicon-search");
		$("#idBtnBuscarPlaca").click(buscarVehiculo);		
		
		// Limpia los campos del monto
		$("#txtPrecio").prop("disabled", true);
		$("#txtPrecio").val("");
		$("#txtPrima").val("");
	}catch(err){
		emitirErrorCatch(err, "reiniciarBusquedaVehiculo")
	}
}
