const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const initSqlJs = require('sql.js');

let mainWindow;
let db;
let SQL;
let usuarioLogado = null;

// ======================================================
//  Inicializar banco com SQL.js
// ======================================================
async function inicializarBanco() {
  SQL = await initSqlJs({
    locateFile: file => path.join(__dirname, 'node_modules/sql.js/dist/', file)
  });

  const dbDir = path.join(__dirname, 'database');
  const dbPath = path.join(dbDir, 'banco.sqlite');

  // cria pasta /database se não existir
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (fs.existsSync(dbPath)) {
    // carrega banco existente
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    // cria banco novo
    db = new SQL.Database();

    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT NOT NULL UNIQUE,
        senha_hash TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS vendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        valor REAL NOT NULL,
        tipo TEXT NOT NULL,
        data TEXT NOT NULL,
        hora TEXT NOT NULL
      );
    `);

    salvarBanco();
  }

  // cria usuário admin se não existir
  const result = db.exec("SELECT * FROM usuarios WHERE usuario='admin'");
  if (result.length === 0) {
    const senhaHash = bcrypt.hashSync('123', 10);
    db.run(`INSERT INTO usuarios (usuario, senha_hash) VALUES ('admin', '${senhaHash}')`);
    salvarBanco();
  }
}

// ======================================================
//  Salvar banco no arquivo
// ======================================================
function salvarBanco() {
  const data = db.export(); 
  const buffer = Buffer.from(data);
  fs.writeFileSync(path.join(__dirname, "database", "banco.sqlite"), buffer);
}

// ======================================================
//  Criar janela principal
// ======================================================
function criarJanela() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'login.html'));
  // mainWindow.webContents.openDevTools(); // descomente para debug
}

app.on('ready', async () => {
  await inicializarBanco();
  criarJanela();
});

// ======================================================
//  IPC: Login
// ======================================================
ipcMain.handle('login', async (event, usuario, senha) => {
  try {
    const res = db.exec(`SELECT * FROM usuarios WHERE usuario='${usuario}'`);

    if (!res.length) return { sucesso: false, mensagem: "Usuário não encontrado" };

    const row = res[0].values[0];
    const senhaHash = row[2];

    if (!bcrypt.compareSync(senha, senhaHash)) {
      return { sucesso: false, mensagem: 'Senha incorreta' };
    }

    usuarioLogado = usuario;
    return { sucesso: true };
  } catch (erro) {
    return { sucesso: false, mensagem: erro.message };
  }
});

// ======================================================
//  IPC: Salvar venda
// ======================================================
ipcMain.handle('salvar-venda', async (event, valor, tipo, data, hora) => {
  if (!usuarioLogado) return { sucesso: false, mensagem: "Não autorizado" };

  try {
    db.run(`
      INSERT INTO vendas (valor, tipo, data, hora)
      VALUES (${valor}, '${tipo}', '${data}', '${hora}')
    `);

    salvarBanco();
    return { sucesso: true };
  } catch (e) {
    return { sucesso: false, mensagem: e.message };
  }
});

// ======================================================
//  Obter vendas do dia
// ======================================================
ipcMain.handle('obter-vendas-dia', async (event, data) => {
  if (!usuarioLogado) return { sucesso: false, vendas: [] };

  try {
    const res = db.exec(`
      SELECT * FROM vendas WHERE data='${data}' ORDER BY hora DESC
    `);

    const vendas = res.length ? res[0].values.map(v => ({
      id: v[0],
      valor: v[1],
      tipo: v[2],
      data: v[3],
      hora: v[4]
    })) : [];

    return { sucesso: true, vendas };
  } catch (e) {
    return { sucesso: false, vendas: [], mensagem: e.message };
  }
});

// ======================================================
//  Navegar entre telas
// ======================================================
ipcMain.handle('navegar', async (event, pagina) => {
  await mainWindow.loadFile(path.join(__dirname, 'src', pagina + '.html'));
  return true;
});
