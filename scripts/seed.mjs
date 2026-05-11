import fs from "node:fs";
import path from "node:path";
import initSqlJs from "sql.js";

const root = process.cwd();
const dbPath = path.resolve(root, process.env.DATABASE_PATH || "./data/receipt-splitter.sqlite");
const ifEmpty = process.argv.includes("--if-empty");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const SQL = await initSqlJs();
const fileExists = fs.existsSync(dbPath);
const db = fileExists ? new SQL.Database(fs.readFileSync(dbPath)) : new SQL.Database();

db.run(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    tax REAL NOT NULL DEFAULT 0,
    tip REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS people (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    assigned_to TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY(assigned_to) REFERENCES people(id) ON DELETE SET NULL
  );
`);

const existingCount = db.exec("SELECT COUNT(*) AS count FROM sessions")[0]?.values?.[0]?.[0] ?? 0;
if (!ifEmpty || Number(existingCount) === 0) {
  const now = new Date().toISOString();
  const sessionId = "demo-brunch";
  db.run("DELETE FROM items WHERE session_id = ?", [sessionId]);
  db.run("DELETE FROM people WHERE session_id = ?", [sessionId]);
  db.run("DELETE FROM sessions WHERE id = ?", [sessionId]);
  db.run("INSERT INTO sessions (id, title, tax, tip, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [
    sessionId,
    "Sunday Brunch",
    6.52,
    14.5,
    "USD",
    now,
    now
  ]);
  const people = [
    ["person-ana", "Ana"],
    ["person-ben", "Ben"],
    ["person-mira", "Mira"]
  ];
  for (const [id, name] of people) {
    db.run("INSERT INTO people (id, session_id, name, created_at) VALUES (?, ?, ?, ?)", [id, sessionId, name, now]);
  }
  const items = [
    ["item-1", "Shakshuka", 16.0, "person-ana"],
    ["item-2", "Avocado Toast", 14.5, "person-ben"],
    ["item-3", "Pancakes", 13.0, "person-mira"],
    ["item-4", "Coffee Carafe", 11.0, null]
  ];
  for (const [id, name, price, assignedTo] of items) {
    db.run("INSERT INTO items (id, session_id, name, price, assigned_to, created_at) VALUES (?, ?, ?, ?, ?, ?)", [
      id,
      sessionId,
      name,
      price,
      assignedTo,
      now
    ]);
  }
}

fs.writeFileSync(dbPath, Buffer.from(db.export()));
db.close();
console.log(`Seeded SQLite database at ${dbPath}`);
