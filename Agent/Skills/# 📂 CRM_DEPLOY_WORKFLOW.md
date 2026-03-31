# **🚀 crm-deploy-skill.md**

## **🎯 OBJETIVO**

Garantir que o ecossistema **CRM Elite** seja publicado de forma segura, rápida e sem erros de rota (404). Este manual define o padrão de infraestrutura no **Firebase Hosting**.

---

### **1\. 📂 ESTRUTURA DE DIRETÓRIOS (PADRÃO OURO)**

O Agente deve garantir que **todos** os arquivos acessíveis pelo navegador estejam dentro da pasta `/public`.

* **Raiz da `/public`:** `index.html`, `login.html`, `404.html`.  
* **Subpastas:**  
  * `/public/admin/`: Todas as telas protegidas (Dashboard, Kanban, Tasks).  
  * `/public/assets/`: CSS, JS e Imagens.  
  * `/public/assets/js/firebase-config.js`: Central de chaves (Obrigatório).

---

### **2\. 🛡️ SECURITY RULES (SEGURANÇA TOTAL)**

O Agente deve gerar e aplicar as regras do **Firestore** e **Storage** para impedir acesso não autorizado.

* **Regra de Ouro:** `allow read, write: if request.auth != null;`  
* **Privacidade:** Leads só podem ser visualizados por quem os criou, a menos que o usuário tenha a tag `role: 'admin'`.

---

### **3\. 🚦 CONFIGURAÇÃO DO `firebase.json`**

Para evitar erros de navegação em Single Page Apps (SPA), o arquivo de configuração deve conter:

JSON  
{  
  "hosting": {  
    "public": "public",  
    "ignore": \["firebase.json", "\*\*/.\*", "\*\*/node\_modules/\*\*"\],  
    "rewrites": \[  
      { "source": "\*\*", "destination": "/index.html" }  
    \]  
  }  
}

---

### **4\. ⚡ WORKFLOW DE PUBLICAÇÃO (PASSO A PASSO)**

Sempre que uma nova funcionalidade for finalizada, o Agente deve instruir o usuário a:

1. **Validar localmente:** Testar no navegador se as rotas `admin/` estão chamando os arquivos JS corretos.  
2. **Limpeza de Cache:** Garantir que o `index.html` redirecionador esteja na raiz da `public`.  
3. **Comando de Voo:** Executar `firebase deploy` no terminal.

---

### **5\. 🔍 CHECKLIST DE PRÉ-DEPLOY**

Antes de sugerir o deploy, o Agente deve verificar:

* \[ \] As chaves do Firebase em `firebase-config.js` são as do projeto `crm-unico-c9`.  
* \[ \] A `GEMINI_API_KEY` está presente e exportada.  
* \[ \] Não existem arquivos `.php` ou `.sql` (limpeza total da migração).  
* \[ \] O arquivo `auth.js` redireciona para o caminho correto pós-login.

