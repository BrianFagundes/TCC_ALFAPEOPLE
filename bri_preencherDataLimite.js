// Biblioteca web que calcula Data_limite

function preencherDataLimite(executionContext) {
    var formContext = executionContext.getFormContext();

    var categoria = formContext.getAttribute("bri_categoria").getValue();
    if (!categoria) return;

    var categoriaId = categoria[0].id.replace("{", "").replace("}", "");

    // Buscar prioridade na tabela categoria_solicitacao
    Xrm.WebApi.retrieveRecord("bri_categoria_solicitacao1", categoriaId, "?$select=bri_prioridade")
        .then(function(result) {

            var prioridade = result.bri_prioridade;
            var dias = 0;

            if (prioridade === 760410002) dias = 1;
            if (prioridade === 760410001) dias = 3;
            if (prioridade === 760410000) dias = 7;

            var data = new Date();
            data.setDate(data.getDate() + dias);

            formContext.getAttribute("bri_data_limite").setValue(data);
        })
        .catch(function(error) {
            console.log(error);
        });
}
