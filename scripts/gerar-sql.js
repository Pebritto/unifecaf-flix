const fs = require("fs");
const path = require("path");

const CSV = path.join(__dirname, "..", "world_imdb_movies_top_movies_per_year.csv");
const OUT = path.join(__dirname, "..", "database", "unifecaf_flix.sql");
const LIMITE = 200;

// Parser de uma linha CSV respeitando aspas duplas.
function parseLinha(linha) {
  const campos = [];
  let atual = "";
  let dentroAspas = false;
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (c === '"') {
      if (dentroAspas && linha[i + 1] === '"') { atual += '"'; i++; }
      else dentroAspas = !dentroAspas;
    } else if (c === "," && !dentroAspas) {
      campos.push(atual); atual = "";
    } else {
      atual += c;
    }
  }
  campos.push(atual);
  return campos;
}

function escapar(valor) {
  if (valor === null || valor === undefined || valor === "") return "NULL";
  return "'" + String(valor).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}

function numeroOuNull(valor) {
  const n = Number(String(valor).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && valor !== "" ? n : "NULL";
}

const conteudo = fs.readFileSync(CSV, "utf8");
const linhas = conteudo.split(/\r?\n/).filter((l) => l.trim() !== "");
const cabecalho = parseLinha(linhas[0]);
const idx = (nome) => cabecalho.indexOf(nome);

const iTitle = idx("title");
const iYear = idx("year");
const iDuration = idx("duration");
const iRating = idx("rating_imdb");
const iVote = idx("vote");
const iDirector = idx("director");
const iStar = idx("star");
const iGenre = idx("genre");

const filmes = linhas.slice(1)
  .map(parseLinha)
  .filter((c) => c[iTitle] && c[iTitle].trim() !== "")
  .map((c) => ({
    nome: c[iTitle],
    ano: c[iYear],
    duracao: c[iDuration],
    diretor: c[iDirector],
    genero: c[iGenre],
    elenco: c[iStar],
    nota: c[iRating],
    votos: Number(String(c[iVote]).replace(/[^0-9]/g, "")) || 0,
  }))
  .sort((a, b) => b.votos - a.votos)
  .slice(0, LIMITE);

function sinopse(f) {
  const partes = [];
  if (f.genero) partes.push(`Filme de ${f.genero}`);
  if (f.ano) partes.push(`lançado em ${f.ano}`);
  if (f.diretor) partes.push(`dirigido por ${f.diretor}`);
  if (f.elenco) partes.push(`estrelando ${f.elenco}`);
  return partes.join(", ") + ".";
}

let sql = "";
sql += "CREATE DATABASE IF NOT EXISTS unifecaf_flix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n";
sql += "USE unifecaf_flix;\n\n";
sql += "DROP TABLE IF EXISTS filme;\n";
sql += "CREATE TABLE filme (\n";
sql += "  id INT AUTO_INCREMENT PRIMARY KEY,\n";
sql += "  nome VARCHAR(255) NOT NULL,\n";
sql += "  sinopse TEXT,\n";
sql += "  ano INT,\n";
sql += "  duracao VARCHAR(20),\n";
sql += "  diretor VARCHAR(255),\n";
sql += "  genero VARCHAR(255),\n";
sql += "  elenco VARCHAR(500),\n";
sql += "  nota_imdb DECIMAL(3,1)\n";
sql += ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n";

for (const f of filmes) {
  const valores = [
    escapar(f.nome),
    escapar(sinopse(f)),
    numeroOuNull(f.ano),
    escapar(f.duracao),
    escapar(f.diretor),
    escapar(f.genero),
    escapar(f.elenco),
    numeroOuNull(f.nota),
  ].join(", ");
  sql += `INSERT INTO filme (nome, sinopse, ano, duracao, diretor, genero, elenco, nota_imdb) VALUES (${valores});\n`;
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, sql, "utf8");
console.log(`Gerado ${OUT} com ${filmes.length} filmes.`);
