\# 📂 CRM\_ELITE\_WORKFLOW.md

\#\# 🎯 OBJETIVO DO PROJETO  
Desenvolver um ecossistema de Social Selling de alta performance. O foco é transformar leads brutos em oportunidades qualificadas através de uma interface premium, lógica de banco de dados relacional e inteligência artificial (Gemini 3).

\---

\#\# 🛠️ FASE 1: DESCOBERTA E DEFINIÇÃO (INPUT DO USUÁRIO)

1\.  \*\*Nicho e Propósito:\*\* O Agente deve solicitar a descrição do negócio e o objetivo principal (Ex: "Vender infoprodutos", "Agência de tráfego").  
2\.  \*\*Molde de Dados (Colunas de Ouro):\*\* Apresentar a estrutura profissional pré-validada (crm-database-skill.md).  
3\.  \*\*Pergunta de Expansão:\*\* Questionar explicitamente: \*"Deseja acrescentar mais alguma coluna de informação específica para o seu nicho?"\*  
4\.  \*\*Confirmação do Kanban:\*\* Validar a régua de status:  
    \* \`iniciou\_atendimento\`  
    \* \`conversando\`  
    \* \`abandonou\_conversa\`  
    \* \`agendamento\`  
    \* \`follow\_up\`  
    \* \`compareceu\`  
5\.  \*\*Métricas do Dashboard (Home):\*\* Definir KPIs de monitoramento da saúde do negócio (crm-pages-skill.md).  
6\.  \*\*Estratégia de Follow Up (Régua de Resgate):\*\* Apresentar a régua fixa (Horário Comercial):  
    \* \*\*FU 1:\*\* 20 minutos de inatividade.  
    \* \*\*FU 2:\*\* 12 horas de inatividade.  
    \* \*\*FU 3:\*\* 16 horas de inatividade.

\---

\#\# ⚙️ FASE 2: SETUP TÉCNICO SILENCIOSO

1\.  \*\*Modelagem do Banco (SQL Skill):\*\* Acionar ferramenta de banco de dados (Supabase/Firebase) para criar tabelas/coleções.  
2\.  \*\*Cérebro de Dados:\*\* Desenvolver Hooks e conexões Realtime para garantir que o CRM seja reativo.

\---

\#\# 🛑 FASE 3: VERIFICAÇÃO DE BANCO DE DADOS (DATABASE CHECK)

\* \*\*Pausa de Segurança:\*\* O Agente deve pausar e solicitar validação manual.  
\* \*\*Instrução:\*\* \*"Por favor, abra o painel do seu banco de dados e valide a criação das tabelas. Aguardarei sua confirmação (Sim/Não) para prosseguir."\*

\---

\#\# 🏗️ FASE 4: ESTRUTURAÇÃO DE NAVEGAÇÃO

1\.  \*\*Setup de Rotas e Sidebar:\*\* Criar o esqueleto de navegação.  
2\.  \*\*Arquivos Base:\*\* Dashboard, Leads, Kanban, Follow-up, Agendamentos e Configurações.

\---

\#\# 🎨 FASE 5: UI/UX & COMPONENTES PREMIUM

1\.  \*\*Design System:\*\* Implementar Dark Mode Absoluto (High-SaaS: \`\#0A0A0A\`, \`\#1E3A8A\`).  
2\.  \*\*Micro-interações:\*\* Cards arredondados, sombras suaves e transições de status.  
3\.  \*\*Kanban Interativo:\*\* Implementar funcionalidade Drag-and-Drop funcional.

\---

\#\# 🤖 FASE 6: INTELIGÊNCIA ARTIFICIAL (GEMINI 3\)

1\.  \*\*Classificação de Leads:\*\* Integrar API do Gemini para analisar faturamento e urgência.  
2\.  \*\*Output JSON:\*\* Retornar \`score\_potencial\` (0-100) e \`tags\_ai\` para visualização rápida no card.  
3\.  \*\*Insights Dinâmicos:\*\* Resumo automático do potencial do lead baseado na conversa.

\---

\#\# 🔐 FASE 7: SEGURANÇA E GESTÃO DE TIME

1\.  \*\*Autenticação:\*\* Implementar login seguro (Auth).  
2\.  \*\*Permissões de Usuário:\*\* Diferenciar Admin (Dono) de Vendedor (Operador).  
3\.  \*\*Log de Auditoria:\*\* Registrar movimentações e edições de leads.

\---

\#\# 🚀 FASE 8: DEPLOY E QA FINAL

1\.  \*\*Checklist de Performance:\*\* Verificar tempos de resposta e bugs de interface.  
2\.  \*\*Deploy em Produção:\*\* Subir a versão final para o link oficial.  
3\.  \*\*Handover:\*\* Documentação de uso para o time de Social Selling.  
