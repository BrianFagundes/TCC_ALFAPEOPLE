// .js - Ribbon

// new_js_encerrarSolicitacao.js
var Bri = Bri || {};
Bri.Solicitacao = Bri.Solicitacao || {};

Bri.Solicitacao.encerrarSolicitacao = function (contextOrForm) {
    try {
        var formContext = null;

        if (contextOrForm && typeof contextOrForm.getFormContext === "function") {
            formContext = contextOrForm.getFormContext();
            console.log("Recebeu executionContext.");
        } else if (contextOrForm && typeof contextOrForm.getAttribute === "function") {
            formContext = contextOrForm;
            console.log("Recebeu formContext direto.");
        } else if (typeof Xrm !== "undefined" && Xrm && Xrm.Page) {
            formContext = Xrm.Page;
            console.log("Usando Xrm.Page como fallback.");
        }

        if (!formContext) {
            var msg = "Não foi possível obter formContext. Verifique se o botão está passando 'PrimaryControl' (executionContext).";
            console.error(msg, contextOrForm);
            Xrm.Navigation.openAlertDialog({ text: msg });
            return;
        }

        var tituloAttr = formContext.getAttribute("bri_titulo");
        var responsavelAttr = formContext.getAttribute("bri_responsavel");
        var statusAttr = formContext.getAttribute("bri_status");
        var dataConclusaoAttr = formContext.getAttribute("bri_data_conclusao");

        var titulo = tituloAttr ? tituloAttr.getValue() : null;
        var responsavel = responsavelAttr ? responsavelAttr.getValue() : null;

        if (!titulo) {
            Xrm.Navigation.openAlertDialog({ text: "Preencha o título antes de encerrar." });
            return;
        }
        if (!responsavel) {
            Xrm.Navigation.openAlertDialog({ text: "Atribua um responsável antes de encerrar." });
            return;
        }

        var confirmStrings = { text: "Deseja encerrar esta solicitação?" };
        var confirmOptions = { height: 200, width: 450 };

        Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(function (success) {
            if (success.confirmed) {
                
                if (statusAttr) statusAttr.setValue(760410001);
                if (dataConclusaoAttr) dataConclusaoAttr.setValue(new Date());
                formContext.data.entity.save();
            }
        });
    } catch (err) {
        var erro = "Erro no JS: " + (err && err.message ? err.message : err);
        console.error(erro, err);
        Xrm.Navigation.openAlertDialog({ text: erro });
    }
};
