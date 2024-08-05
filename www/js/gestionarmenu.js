$(document).ready(function(){
	cargarConfiguracionDelMenu(); 
});
var arrayOpcionesConfig= new Array(); // array de opciones
var arrayOpcionesUsadasXperfiles=new Array(); // array de opciones cargadas en los perfiles
var valorRadioSeleccionado=new Array();
var filaSeleccionadaAnterior; // menu seleccionado anterior
function cargarConfiguracionDelMenu(){ // carga las opciones del menu actualmente guardas en el xml
    try{
        //valorRadioSeleccionado.length=0;
        fancyAlertWait("Cargando");
        arrayOpcionesUsadasXperfiles.length=0;
        arrayOpcionesConfig.length=0;
        for(var i=0; i<parent.arrayOpciones.length; i++){
            arrayOpcionesConfig[arrayOpcionesConfig.length]={
                nombreMenu:parent.arrayOpciones[i].nombreMenu, 
                idMenu:parent.arrayOpciones[i].idMenu, 
                hijo:parent.arrayOpciones[i].hijo, 
                padre:parent.arrayOpciones[i].padre, 
                href:parent.arrayOpciones[i].href, 
                categoria:parent.arrayOpciones[i].categoria
            };
            $("#tablaConfig > tbody").append("<tr id='tr_"+parent.arrayOpciones[i].idMenu+"_"+i+"' style='font-size: 13.5px; font-weight: bold; background-color: #afcaff; height: 40px;'>" +
                "<td>" +
                "<center><input type='checkbox' class='seleccion' name='seleccion' value='tr_"+parent.arrayOpciones[i].idMenu+"_"+i+"' onchange='seleccionarMenu(this)'>" +
                "</center>" +
                "</td>"+
                "<td>" +
                "<input type='radio' name='seleccionNivel"+i+"' VALUE='0' onchange='cambiarNivel(this.value, "+'"'+i+'"'+")' >1" +
                "<input type='radio' name='seleccionNivel"+i+"' VALUE='1' onchange='cambiarNivel(this.value, "+'"'+i+'"'+")' >2" +
                "<input type='radio' name='seleccionNivel"+i+"' VALUE='2' onchange='cambiarNivel(this.value, "+'"'+i+'"'+")' >3" +
                "</td>" +
                "<td id='button0_"+i+"' align='center' style='vertical-align: middle'></td>" +
                "<td id='button1_"+i+"' align='center' style='vertical-align: middle'></td>" +
                "<td id='button2_"+i+"' align='center' style='vertical-align: middle'></td>" +
                "<td><center><input type='text' value='"+parent.arrayOpciones[i].href+"'></center></td>" +
                "</tr>");
            $("input[name=seleccionNivel"+i+"][value='"+parent.arrayOpciones[i].categoria+"']").prop("checked",true); // selecciona radio button de la categoria

            $("#button"+parent.arrayOpciones[i].categoria+"_"+i).html(
                "<input type='text' value='"+parent.arrayOpciones[i].nombreMenu+"' style='font-size:11.5px; padding-left:6px; color:white; height: 30px; width: 130px; background-color: #0085C8; border-width: 1px; border-radius: 8px;'>"
                );
            valorRadioSeleccionado[valorRadioSeleccionado.length]=parent.arrayOpciones[i].categoria;
        }
        webService("getAllOpcionesUsadas", "", "cargarOpcionesUsadasEnPerfiles()");
    }catch (err){
        var txt = "Se encontro un error en la funcion cargarConfiguracionDelMenu.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}
function seleccionarMenu(thes){ // recibe el parametro
    try{
        trSeleccionada=$(thes).parents().get(2);//.css("background-color", "yellow");
        $(trSeleccionada).css("background-color", "yellow");
        $('input.seleccion').not(thes).prop('checked', false);
        if(filaSeleccionadaAnterior!=undefined){ // existe fila seleccionada anteriormente
            $("#"+filaSeleccionadaAnterior).css("background-color", "#afcaff");
        }
        filaSeleccionadaAnterior=trSeleccionada.id;

    }catch (err){
        var txt = "Se encontro un error en la funcion seleccionarMenu.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}
function cambiarNivel(categoria, index){
    try{
        $("#button"+arrayOpcionesConfig[index].categoria+"_"+index).children().remove();
        $("#button"+categoria+"_"+index).html(
                "<input type='text' value='"+arrayOpcionesConfig[index].nombreMenu+"' style='font-size:11.5px; padding-left:6px; color:white; height: 30px; width: 130px; background-color: #0085C8; border-width: 1px; border-radius: 8px;'>"
        );
        arrayOpcionesConfig[index].categoria=categoria;
    }catch (err){
        var txt = "Se encontro un error en la funcion cambiarNivel.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}
function agregarMenu(){ // agrega menu
    try{
        if(validarInputsValueXid("idNombreMenu-Nombre Menu")){
            if($("input[type='radio'][name='nivelSeleccion']:checked").length>0){
                var indexLast=arrayOpcionesConfig.length;
                var nombreMenu = $("#idNombreMenu").val();
                var categoria = $("input[type='radio'][name='nivelSeleccion']:checked").val();
                $("#tablaConfig > tbody").prepend("<tr id='tr_"+indexLast+"_"+indexLast+"' style='font-size: 13.5px; font-weight: bold; background-color: #afcaff; height: 40px;'>" +
                    "<td>" +
                    "<center>" +
                    "<input type='checkbox' class='seleccion' name='seleccion' value='tr_"+indexLast+"_"+indexLast+"' onchange='seleccionarMenu(this)'>" +
                    "</center>" +
                    "</td>"+
                    "<td>" +
                    "<input type='radio' name='seleccionNivel"+indexLast+"' VALUE='0' onchange='cambiarNivel(this.value, "+'"'+indexLast+'"'+")'>1" +
                    "<input type='radio' name='seleccionNivel"+indexLast+"' VALUE='1' onchange='cambiarNivel(this.value, "+'"'+indexLast+'"'+")' >2" +
                    "<input type='radio' name='seleccionNivel"+indexLast+"' VALUE='2' onchange='cambiarNivel(this.value, "+'"'+indexLast+'"'+")' >3" +
                    "</td>" +
                    "<td id='button0_"+indexLast+"' align='center' style='vertical-align: middle'></td>" +
                    "<td id='button1_"+indexLast+"' align='center' style='vertical-align: middle'></td>" +
                    "<td id='button2_"+indexLast+"' align='center' style='vertical-align: middle'></td>" +
                    "<td><center><input type='text' value=''></center></td>" +
                    "</tr>");

                $("input[name=seleccionNivel"+indexLast+"][value='"+categoria+"']").prop("checked",true); // selecciona radio button de la categoria
                $("#button"+categoria+"_"+indexLast).html(
                        "<input type='text' value='"+nombreMenu+"' style='font-size:11.5px; padding-left:6px; color:white; height: 30px; width: 130px; background-color: #0085C8; border-width: 1px; border-radius: 8px;'>"
                );
                arrayOpcionesConfig[arrayOpcionesConfig.length]={nombreMenu:nombreMenu, idMenu:indexLast, hijo:"", padre:"",  href:"", categoria:categoria};
                //cargarPaginasPadres(categoria,indexLast);
                // **** limpia texto y selecciones
                $("#idNombreMenu").val("");
                $("input[name=nivelSeleccion]").prop("checked", false);
                valorRadioSeleccionado[indexLast]=categoria;

            }else{
                fancyAlert("falta seleccionar un nivel")
            }
        }
        $("#tablaConfig > tbody").append();

    }catch (err){
        var txt = "Se encontro un error en la funcion agregarMenu.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}
function subirBajar(flag){
    try{
        // busca si existen radios seleccionados
        radioSeleccionado=$("input[type='checkbox'][name='seleccion']:checked");
        if(radioSeleccionado.length>0){
            // guardar toda la variable de la fila TR y eliminarla despues la copiamos
            var filaHMTLtr=$("#"+radioSeleccionado.val())[0].outerHTML;
            switch(flag){
                case '+':
                    // sube la fila:
                    filaAnterior = $("#"+radioSeleccionado.val()).prev('tr');
                    console.log("ant: "+filaAnterior.html());
                    if(filaAnterior.html()!=undefined){
                        $("#"+radioSeleccionado.val()).remove(); // elimina
                        filaAnterior.before(filaHMTLtr);
                    }
                    break;
                case '-':
                    filaPosterior = $("#"+radioSeleccionado.val()).next('tr');
                    console.log("post: "+filaPosterior.html());
                    if(filaPosterior.html()!=undefined){
                        $("#"+radioSeleccionado.val()).remove(); // elimina
                        filaPosterior.after(filaHMTLtr);
                    }
                    break;
            }
            // obtenemos en index:
            getIndex=radioSeleccionado.val().split("_");
            getIndex=getIndex[2];
            $("input[name=seleccionNivel"+getIndex+"][value='"+arrayOpcionesConfig[getIndex].categoria+"']").prop("checked",true);
            $("input[type='checkbox'][name='seleccion'][value='"+radioSeleccionado.val()+"']").prop("checked", true);

        }else{
            fancyAlert("Debe seleccionar una fila para ordenarla");
            return;
        }

    }catch (err){
        var txt = "Se encontro un error en la funcion subirBajar.\n\n";
        txt += "Error: " + err.message + "\n\n";
        txt += "Click ACEPTAR para continuar.\n\n";
        alert(txt);
    }
}