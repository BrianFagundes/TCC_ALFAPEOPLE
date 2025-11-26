//Plugin

using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace TCC_GestaoSolicitacoes.Plugins
{
    public class SolicitacaoFinalizadaPlugin : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            // CONTEXTOS DO CRM
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = serviceFactory.CreateOrganizationService(context.UserId);
            var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            try
            {
                // Verifica se existe Target
                if (!context.InputParameters.Contains("Target"))
                    return;

                // Registro que está sendo atualizado
                var entity = (Entity)context.InputParameters["Target"];

                // Só executa se o status foi alterado
                if (!entity.Contains("bri_status"))
                    return;

                // Novo valor do option set
                var novoStatus = entity.GetAttributeValue<OptionSetValue>("bri_status");

                // VALOR DO STATUS FINALIZADO
                int valorFinalizado = 760410001;

                if (novoStatus.Value != valorFinalizado)
                    return;

                // ID da solicitação
                Guid solicitacaoId = entity.Id;

                // Buscar dados completos da solicitação (responsável, data_limite)
                var columns = new ColumnSet("bri_responsavel", "bri_data_limite");
                var solicitacao = service.Retrieve("bri_solicitacao1", solicitacaoId, columns);

                EntityReference responsavel = null;
                if (solicitacao.Contains("bri_responsavel"))
                    responsavel = solicitacao.GetAttributeValue<EntityReference>("bri_responsavel");

                DateTime? dataLimite = null;

                if (solicitacao.Contains("bri_data_limite"))
                    dataLimite = solicitacao.GetAttributeValue<DateTime>("bri_data_limite");

                // Criar registro na tabela de histórico
                Entity historico = new Entity("bri_tabela4");
                historico["bri_solicitacao"] = new EntityReference("bri_solicitacao1", solicitacaoId);
                historico["bri_data"] = DateTime.Now.AddHours(-3);
                historico["bri_data_limite"] = dataLimite.Value.AddHours(-3);

                service.Create(historico);

                tracing.Trace("Histórico criado com sucesso quando status foi finalizado.");
            }
            catch (Exception ex)
            {
                tracing.Trace("Erro Plugin: " + ex.ToString());
                throw new InvalidPluginExecutionException("Erro no Plugin: " + ex.Message);
            }
        }
    }
}
