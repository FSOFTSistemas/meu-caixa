# Meu Caixa - Sistema de Fluxo de Caixa Local

Um sistema completo de fluxo de caixa desenvolvido com **Electron** e **SQLite**, funcionando 100% localmente sem necessidade de conexão com servidor externo.

## Características

✅ **Aplicação Desktop** - Funciona em Windows e Mac  
✅ **Banco de Dados Local** - SQLite integrado  
✅ **Autenticação Segura** - Login com hash bcrypt  
✅ **Interface de Calculadora** - Entrada/Saída de valores  
✅ **Relatório Diário** - Visualização e impressão de vendas  
✅ **Sem Dependências Externas** - Tudo funciona offline  

## Requisitos

- Node.js 14+ instalado
- npm ou yarn

## Instalação

1. **Descompacte o arquivo** `meu-caixa.zip`

2. **Abra o terminal** na pasta do projeto

3. **Instale as dependências:**
```bash
npm install
```

## Executar a Aplicação

```bash
npm start
```

A aplicação será aberta automaticamente.

## Credenciais Padrão

| Campo | Valor |
|-------|-------|
| **Usuário** | admin |
| **Senha** | 123 |

## Como Usar

### 1. Login
- Digite o usuário e senha
- Clique em "Entrar"

### 2. Calculadora de Vendas
- Selecione o tipo: **ENTRADA** (verde) ou **SAÍDA** (vermelho)
- Digite o valor usando os botões numéricos
- Clique em **OK** para salvar
- Use **C** para limpar o display

### 3. Relatório Diário
- Clique em **Relatório**
- Selecione a data desejada
- Visualize o resumo: Entradas, Saídas e Resultado
- Clique em **Imprimir** para gerar relatório em PDF

### 4. Logout
- Clique em **Sair** para fazer logout

## Estrutura do Projeto

```
meu-caixa/
├── main.js                 # Processo principal do Electron
├── preload.js              # Bridge segura entre frontend e backend
├── package.json            # Dependências do projeto
├── README.md               # Este arquivo
├── database/
│   └── banco.sqlite        # Banco de dados SQLite (criado automaticamente)
└── src/
    ├── login.html          # Tela de login
    ├── login.js            # Lógica de login
    ├── calculadora.html    # Tela da calculadora
    ├── calculadora.js      # Lógica da calculadora
    ├── relatorio.html      # Tela de relatório
    ├── relatorio.js        # Lógica do relatório
    └── styles.css          # Estilos da aplicação
```

## Banco de Dados

O sistema cria automaticamente duas tabelas:

### Tabela: usuarios
```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL
);
```

### Tabela: vendas
```sql
CREATE TABLE vendas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  valor REAL NOT NULL,
  tipo TEXT NOT NULL,
  data TEXT NOT NULL,
  hora TEXT NOT NULL
);
```

## Segurança

- ✅ Senhas armazenadas com hash bcrypt
- ✅ Validação de autenticação em todas as operações
- ✅ Context Isolation ativado no Electron
- ✅ Node Integration desativado
- ✅ Preload script para comunicação segura

## Desenvolvimento

Para adicionar novas funcionalidades:

1. Edite os arquivos HTML em `src/`
2. Adicione a lógica em `src/*.js`
3. Estenda as rotas IPC em `main.js`
4. Adicione estilos em `src/styles.css`

## Troubleshooting

**Erro: "better-sqlite3 not found"**
```bash
npm install --build-from-source
```

**Banco de dados corrompido**
- Delete o arquivo `database/banco.sqlite`
- Reinicie a aplicação (será recriado automaticamente)

**Esqueceu a senha**
- Delete o arquivo `database/banco.sqlite`
- Reinicie a aplicação
- Use as credenciais padrão (admin / 123)

## Licença

Desenvolvido com ❤️ para gerenciamento de caixa local.

## Suporte

Para dúvidas ou problemas, verifique:
1. Se o Node.js está instalado corretamente
2. Se todas as dependências foram instaladas (`npm install`)
3. Se a pasta `database/` tem permissão de escrita
# meu-caixa
