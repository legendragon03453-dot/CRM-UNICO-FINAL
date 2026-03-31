# **📑 crm-pages-skill.md**

## **🏗️ ARQUITETURA DE PÁGINAS (MAPA DO SISTEMA)**

Este documento define a hierarquia, os componentes e as permissões de cada tela do **CRM Elite**.

---

### **1\. 🔐 AUTH & ACESSO (Público/Protegido)**

* **Página: `login.html` (Index Principal)**  
  * **Visual:** Dark Mode Absoluto, centralizado, foco em UX limpa.  
  * **Função:** Login via Firebase Auth (E-mail/Senha).  
  * **Lógica:** Se logado, redireciona para o Dashboard correspondente ao cargo (Admin ou Comercial).

---

### **2\. 📊 DASHBOARDS (Visão Analítica)**

* **Página: `dashboard-comercial.html` (Visão Operador)**  
  * **Métricas:** Faturamento Pessoal, Total de Leads Captados, Meus Leads Ativos.  
  * **Feedback:** Painel de "Pontos Positivos e Negativos" (Análise da IA sobre a performance do vendedor).  
  * **Widget:** Resumo das 3 tarefas (tasks) mais urgentes do dia.  
* **Página: `dashboard-admin.html` (Visão Estratégica)**  
  * **Métricas Globais:** Faturamento Total do Time, Volume de Leads por canal.  
  * **Monitoramento:** Tabela de performance por funcionário (taxa de conversão, tempo de resposta).  
  * **Filtros:** Ver dados por data ou por vendedor específico.

---

### **3\. ⚡ OPERAÇÃO (O Coração da Venda)**

* **Página: `kanban.html` (Geral)**  
  * **Visual:** Colunas arrastáveis (Drag-and-Drop).  
  * **Cards:** Devem exibir Nome, Foto do Social (se houver), Score da IA e Tag de Urgência.  
* **Página: `leads.html` (Base de Dados)**  
  * **Função:** Tabela pesquisável com todos os leads.  
  * **Ações:** Botão para exportar, editar ou deletar leads.  
* **Página: `follow-up.html` (Resgate)**  
  * **Função:** Lista inteligente de leads que entraram na régua de inatividade (20min, 12h, 16h).  
  * **Lógica:** Prioriza leads "quentes" que pararam de responder.  
* **Página: `agendamentos.html` (Calendário)**  
  * **Visual:** Visualização mensal/semanal.  
  * **Função:** Marcar reuniões, chamadas de fechamento e demonstrações.

---

### **4\. ✅ GESTÃO DE TAREFAS (Workflow)**

* **Página: `tasks-user.html` (Minhas Tarefas)**  
  * **Função:** Checklist diária. Conforme o vendedor completa, a barra de progresso no Dashboard Admin sobe.  
* **Página: `tasks-management.html` (Admin Only)**  
  * **Função:** Criar e delegar tarefas. O Admin seleciona o usuário e define a data/prioridade.

---

### **5\. 🛠️ ADMINISTRAÇÃO E PERFIL**

* **Página: `admin-panel.html` (Controle Total)**  
  * **Função:** Gerenciamento de cargos (Admin/Sales), edição de tags globais e remoção de usuários.  
* **Página: `configuracoes.html` (Sistema)**  
  * **Função:** Configurações de API (Gemini Key, Firebase), temas e notificações.  
* **Página: `perfil.html` (Minha Conta)**  
  * **Dados:** Nome, E-mail, Alteração de Senha.  
  * **Performance:** Exibição detalhada dos feedbacks da IA sobre o comportamento de vendas do usuário.

---

## **🎨 PADRÕES DE DESIGN (UI/UX)**

* **Cores:** Fundo `#0A0A0A`, Cards `#141414`, Bordas `#333333`.  
* **Tipografia:** Inter ou Sans-serif moderna.  
* **Responsividade:** O Dashboard deve ser focado em Desktop (uso profissional), mas o Kanban deve ser utilizável no mobile para Social Selling rápido.

---

### **💡 Como aplicar este arquivo:**

1. Salve este conteúdo como `crm-pages-skill.md`.  
2. Mande para o Antigravity e diga:  
   "Com base no workflow, use as definições do arquivo `crm-pages-skill.md` para criar a estrutura de navegação e as telas do sistema. Comece garantindo que o `login.html` redirecione corretamente os cargos."

