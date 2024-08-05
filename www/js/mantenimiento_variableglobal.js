var DAO = new DAOWebServiceGeT("wbs_mant") // El nombre del web service del modulo Mantenimiento
var myEditorCuerpo
var myEditorPie
var myEditorCuerpoOPA
var myEditorPieOPA
var UIT;
var sueldoMinVital;
cargarInicio(function () {
	$("#idUIT").addClass("solo-numero")
	$("#idSueldoMinimo").addClass("solo-numero")
	asignarNumericos()
	$("#btnGuardar").click(guardar);
	myEditorCuerpo = new dhtmlXEditor({
		parent: "panelCuerpo",
		toolbar: true, // force dhtmlxToolbar using
		iconsPath: "js_editor/codebase/imgs/", // path for toolbar icons
		skin: "dhx_skyblue",
	});
	myEditorPie = new dhtmlXEditor({
		parent: "panelPie",
		toolbar: true, // force dhtmlxToolbar using
		iconsPath: "js_editor/codebase/imgs/", // path for toolbar icons
		skin: "dhx_skyblue",
	});
	clickPestana("Ordenes de Pago Agrav.")
	myEditorCuerpoOPA = new dhtmlXEditor({
		parent: "panelCuerpo_opa",
		toolbar: true, // force dhtmlxToolbar using
		iconsPath: "js_editor/codebase/imgs/", // path for toolbar icons
		skin: "dhx_skyblue",
	});
	myEditorPieOPA = new dhtmlXEditor({
		parent: "panelPie_opa",
		toolbar: true, // force dhtmlxToolbar using
		iconsPath: "js_editor/codebase/imgs/", // path for toolbar icons
		skin: "dhx_skyblue",
	});
	clickPestana("Notificaciones")
	DAO.consultarWebServiceGet("getVariablesGlobales", "", function (data) {
		myEditorCuerpo.setContent(data[0].plantillaCuerpoNotificacion);
		myEditorPie.setContent(data[0].plantillaPieNotificacion);
		myEditorCuerpoOPA.setContent(data[0].plantillaCuerpoOPA);
		myEditorPieOPA.setContent(data[0].plantillaPieOPA);
		$("#idUIT").val(data[0].UIT)
		$("#idSueldoMinimo").val(data[0].sueldoMinVital)
		$("#idFACTNroSerie").val(data[0].FACTNroSerie)
		$("#idBVNroSerie").val(data[0].BVNroSerie)
		$("#idNCNroSerie").val(data[0].NCNroSerie)
		$("#idNCCorrelativoActual").val(data[0].NCCorrelativoActual)
		$("#idFACTCorrelativoActual").val(data[0].FACTCorrelativoActual)
		$("#idBVCorrelativoActual").val(data[0].BVCorrelativoActual)
		$("#idNroAutSUNAT").val(data[0].NroAutSUNAT)
		$("#idNroMaqRegistradora").val(data[0].NroMaqRegistradora)
		UIT = data[0].UIT
		sueldoMinVital = data[0].sueldoMinVital
		$.fancybox.close();
	});
});

function guardar() {
	try {
		fancyConfirm("¿Desea continuar?", function (rpta) {
			if (rpta) {
				var fechaUIT = "";
				if (UIT != $("#idUIT").val()) {
					fechaUIT = "TRUE";
				}
				var fechaSueldoMinVital = ""
				if (sueldoMinVital != $("#idSueldoMinimo").val()) {
					fechaSueldoMinVital = "TRUE"
				}
				var parametros = {
					plantillaCuerpo: myEditorCuerpo.getContent(),
					plantillaPie: myEditorPie.getContent(),
					plantillaCuerpoOPA: myEditorCuerpoOPA.getContent(),
					plantillaPieOPA: myEditorPieOPA.getContent(),
					UIT: $("#idUIT").val(),
					sueldoMinVital: $("#idSueldoMinimo").val(),
					fechaUIT: fechaUIT,
					fechaSueldoMinVital: fechaSueldoMinVital,
					FACTNroSerie: $("#idFACTNroSerie").val(),
					BVNroSerie: $("#idBVNroSerie").val(),
					NCNroSerie: $("#idNCNroSerie").val(),
					NCCorrelativoActual: $("#idNCCorrelativoActual").val(),
					FACTCorrelativoActual: $("#idFACTCorrelativoActual").val(),
					BVCorrelativoActual: $("#idBVCorrelativoActual").val(),
					NroAutSUNAT: $("#idNroAutSUNAT").val(),
					NroMaqRegistradora: $("#idNroMaqRegistradora").val()
				};
				DAO.consultarWebServicePOST(parametros, "actualizarVariablesGlobales", function (data) {
					if (data[0] > 0) {
						UIT = $("#idUIT").val()
						sueldoMinVital = $("#idSueldoMinimo").val()
						fancyAlert("¡Se actualizo correctamente!");
					} else {
						fancyAlert("No se pudo Actualizar");
					}
				});
			}
		})
	} catch (err) {
		emitirErrorCatch(err, "guardar")
	}
}
function clickPestana(pestana) {
	try {
		if (pestana != "" || pestana != undefined) {
			var menuTotal = $("#jQueryTabs1").find("ul").eq(0).find("li");
			menuTotal.each(function () {
				var li_Actual = $(this);
				var href_Actual = li_Actual.find("a").eq(0);
				var spanMenu = href_Actual.find("span").eq(0);
				var nombreMenu = spanMenu.html();
				if (nombreMenu == pestana) {
					href_Actual.click();
				}
			});
		}
	} catch (err) {
		emitirErrorCatch(err, "clickpestana")
	}
}