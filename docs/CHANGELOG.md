# LicitGov — Changelog de Implementações

Registo de todas as alterações, melhorias e funcionalidades implementadas no projeto.

---

## [2026-03-18] — Sessão de Melhorias Gerais

### ✅ AdminDashboard — Modal "Authorize Agent" funcional
- **Ficheiro:** `components/AdminDashboard.tsx`
- **O quê:** O modal "New Agent Access" passou a persistir utilizadores reais no LocalStorage.
- **Antes:** O formulário fechava sem guardar nada (`e.preventDefault()` sem chamar `createUser`). Inputs não controlados.
- **Depois:** Inputs controlados com estado React (`newUserName`, `newUserEmail`, `newUserPassword`, `newUserOrg`, `newUserRole`). Submit chama `createUser` do `mockBackend`. Mostra mensagem de erro se o email já existir.
- **Campos adicionados:** Órgão/Organização, selector de Tipo de Acesso (👤 Usuário / 🔐 Admin).

---

### ✅ AdminDashboard — Botão "Delete" utilizador
- **Ficheiro:** `components/AdminDashboard.tsx`
- **O quê:** Adicionado botão vermelho "Delete" em cada linha da tabela de utilizadores.
- **Antes:** A função `deleteUser` existia no `mockBackend` mas nunca era chamada no UI.
- **Depois:** Botão "Delete" com confirmação via `window.confirm`. Protege o admin principal (lógica já existente no backend). Importação de `deleteUser` adicionada.

---

### ✅ AdminDashboard — Removido tab "Audit Logos" (Branding)
- **Ficheiro:** `components/AdminDashboard.tsx`
- **O quê:** Removido o 4º tab "Audit Logos" com os 24 ícones placeholder.
- **Motivo:** Funcionalidade não necessária para o produto.
- **Tabs restantes:** Agentes, Stress Matrix, Kernel Logs.
- **Nota:** Removido também o `onClick` no logo do header que abria esse tab.

---

### ✅ ResultViewer — Botão "Copiar" com feedback visual
- **Ficheiro:** `components/ResultViewer.tsx`
- **O quê:** Substituído `alert('Texto copiado.')` por feedback visual no próprio botão.
- **Antes:** `alert()` bloqueante do browser.
- **Depois:** Botão fica verde com "✓ Copiado!" por 2 segundos e volta ao estado normal. Usa `useState` + `setTimeout`.

---

### ✅ Novo Componente — HistoryPanel (Histórico de Documentos)
- **Ficheiro:** `components/HistoryPanel.tsx` *(novo)*
- **O quê:** Painel completo para visualizar os documentos gerados pelo utilizador.
- **Funcionalidades:**
  - Lista lateral com todos os documentos do utilizador ordenados por data
  - Preview do documento selecionado renderizado em Markdown
  - Botão "Abrir no Editor" que carrega o documento de volta na app principal
  - Estado vazio com mensagem informativa
- **Integração:** Nova view `'history'` em `App.tsx`. Botão "Meus Documentos" adicionado na `Sidebar`.

---

### ✅ Sidebar — Botão "Meus Documentos"
- **Ficheiro:** `components/Sidebar.tsx`
- **O quê:** Adicionado botão no footer da sidebar para navegar para o histórico de documentos.
- **Props adicionada:** `onHistoryClick: () => void`

---

### ✅ App.tsx — Suporte à view History
- **Ficheiro:** `App.tsx`
- **O quê:** Adicionado `'history'` ao tipo da state `view`. Renderiza `<HistoryPanel>` com callback `onLoadDocument` que restaura o tipo de documento e conteúdo no editor.
- **Importações limpas:** Removidos `SavedDocument` e `getDocumentsByUser` que não eram usados diretamente no `App.tsx`.

---

## Estrutura de Ficheiros

```
licitgov/
├── App.tsx                        # Root — routing entre views (login/app/admin/history)
├── types.ts                       # Tipos globais TypeScript
├── constants.ts                   # Prompts e instrução de sistema do Gemini
├── components/
│   ├── AdminDashboard.tsx         # Painel admin (utilizadores, stress test, logs)
│   ├── HistoryPanel.tsx           # [NOVO] Histórico de documentos do utilizador
│   ├── InputForm.tsx              # Formulário de 4 passos para gerar documentos
│   ├── LoginPage.tsx              # Página de login
│   ├── MarkdownViewer.tsx         # Renderizador de Markdown
│   ├── ResultViewer.tsx           # Visualizador do documento gerado
│   └── Sidebar.tsx                # Navegação lateral
├── services/
│   ├── geminiService.ts           # Integração com Google Gemini API (streaming)
│   └── mockBackend.ts             # Backend simulado com LocalStorage
└── docs/
    └── CHANGELOG.md               # Este ficheiro — registo de alterações
```

---

## Credenciais de Acesso (Desenvolvimento)

| Campo    | Valor                  |
|----------|------------------------|
| Email    | admin@licitgov.com     |
| Password | admin123               |
| Role     | Super Administrador    |

> ⚠️ Alterar antes de produção.

---

## Tecnologias

| Tecnologia       | Versão  | Uso                              |
|------------------|---------|----------------------------------|
| React            | 18.x    | UI Framework                     |
| TypeScript       | 5.x     | Tipagem estática                 |
| Vite             | 6.x     | Build tool / Dev server          |
| Tailwind CSS     | 3.x     | Estilização                      |
| Google Gemini    | 3 Pro   | Geração de documentos com IA     |
| LocalStorage     | —       | Persistência de dados (mock)     |
