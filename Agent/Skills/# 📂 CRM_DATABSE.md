# **🗄️ crm-database-skill.md**

## **🎯 OBJETIVO**

Definir a arquitetura de dados relacional para o **CRM Elite Social Selling** utilizando **Supabase (PostgreSQL)**. O foco é integridade de dados, performance em tempo real e segurança por níveis de acesso.

---

### **1\. 👥 TABELA: `profiles` (Usuários do Sistema)**

Armazena os dados do seu time e define quem manda em quem.

* `id`: uuid (PK, vinculado ao Auth)  
* `email`: text (unique)  
* `full_name`: text  
* `role`: enum ('admin', 'sales') — *Define o acesso às telas.*  
* `points_pos`: text\[\] (array de strings) — *Feedback da IA.*  
* `points_neg`: text\[\] (array de strings) — *Feedback da IA.*  
* `created_at`: timestamp with time zone

---

### **2\. 🎯 TABELA: `leads` (As Colunas de Ouro)**

O coração da operação. Cada lead captado nas redes sociais vem para cá.

* `id`: uuid (PK)  
* `name`: text (not null)  
* `instagram`: text  
* `whatsapp`: text  
* `faturamento_estimado`: numeric  
* `status`: enum (Régua do Kanban)  
  * `iniciou_atendimento`, `conversando`, `abandonou_conversa`, `agendamento`, `follow_up`, `compareceu`  
* **Campos de IA (Cérebro):**  
  * `ai_score`: integer (0-100)  
  * `ai_tags`: jsonb (Ex: \["Alta Urgência", "Decisor", "Ticket Alto"\])  
  * `ai_summary`: text (Resumo do potencial gerado pelo Gemini)  
* `owner_id`: uuid (FK \-\> profiles) — *Vendedor responsável.*  
* `last_activity`: timestamp (Para gatilhos de Follow-up)  
* `created_at`: timestamp

---

### **3\. ✅ TABELA: `tasks` (Gestão de Workflow)**

Tarefas criadas pelo Admin para o time ou automáticas pelo sistema.

* `id`: uuid (PK)  
* `title`: text  
* `description`: text  
* `assigned_to`: uuid (FK \-\> profiles)  
* `created_by`: uuid (FK \-\> profiles) — *Geralmente o Admin.*  
* `due_date`: timestamp  
* `status`: enum ('pending', 'completed', 'overdue')

---

### **4\. 📅 TABELA: `appointments` (Calendário Elite)**

* `id`: uuid (PK)  
* `lead_id`: uuid (FK \-\> leads)  
* `user_id`: uuid (FK \-\> profiles)  
* `scheduled_at`: timestamp  
* `notes`: text

---

### **5\. 🛡️ SEGURANÇA (Row Level Security \- RLS)**

O Antigravity deve configurar as seguintes políticas no banco:

1. **Admin:** Pode `SELECT`, `INSERT`, `UPDATE` e `DELETE` em **todas** as tabelas.  
2. **Sales (Vendedor):**  
   * Só pode ver (`SELECT`) leads e tasks onde `owner_id` ou `assigned_to` seja o seu próprio UUID.  
   * Não pode deletar leads.  
   * Pode ver seu próprio `profile` para checar pontos positivos/negativos.

---

### **6\. ⚡ REALTIME (O Diferencial)**

Habilitar o **Supabase Realtime** nas tabelas `leads` e `tasks`.

* Quando o Admin cria uma Task, o Vendedor recebe a notificação no Dashboard sem dar F5.  
* Quando um Lead muda de coluna no Kanban, o Dashboard do Admin atualiza os gráficos na hora.

