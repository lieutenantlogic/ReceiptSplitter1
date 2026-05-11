import fs from "node:fs";
import path from "node:path";
import initSqlJs, { Database, SqlJsStatic, SqlValue } from "sql.js";
import type { SplitSession } from "@/lib/types";
import { createId } from "@/lib/ids";

let sqlPromise: Promise<SqlJsStatic> | null = null;
let db: Database | null = null;

function getDbPath() {
  return path.resolve(process.cwd(), process.env.DATABASE_PATH || "./data/receipt-splitter.sqlite");
}

async function getSql() {
  sqlPromise ??= initSqlJs();
  return sqlPromise;
}

export async function getDb() {
  if (db) return db;
  const SQL = await getSql();
  const dbPath = getDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  db = fs.existsSync(dbPath) ? new SQL.Database(fs.readFileSync(dbPath)) : new SQL.Database();
  migrate(db);
  persist();
  return db;
}

export function persist() {
  if (!db) return;
  fs.writeFileSync(getDbPath(), Buffer.from(db.export()));
}

function migrate(database: Database) {
  database.run(`
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
}

export async function getSession(id: string): Promise<SplitSession | null> {
  const database = await getDb();
  const sessionRows = select(database, "SELECT * FROM sessions WHERE id = ?", [id]);
  const session = sessionRows[0];
  if (!session) return null;
  const people = select(database, "SELECT * FROM people WHERE session_id = ? ORDER BY created_at", [id]);
  const items = select(database, "SELECT * FROM items WHERE session_id = ? ORDER BY created_at", [id]);

  return {
    id: String(session.id),
    title: String(session.title),
    tax: Number(session.tax),
    tip: Number(session.tip),
    currency: String(session.currency),
    createdAt: String(session.created_at),
    updatedAt: String(session.updated_at),
    people: people.map((person) => ({ id: String(person.id), name: String(person.name) })),
    items: items.map((item) => ({
      id: String(item.id),
      name: String(item.name),
      price: Number(item.price),
      assignedTo: item.assigned_to ? String(item.assigned_to) : null
    }))
  };
}

export async function createSession(input: {
  title: string;
  tax: number;
  tip: number;
  currency: string;
  people: string[];
  items: { name: string; price: number }[];
}) {
  const database = await getDb();
  const now = new Date().toISOString();
  const id = createId("session");
  database.run("INSERT INTO sessions (id, title, tax, tip, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [
    id,
    input.title,
    input.tax,
    input.tip,
    input.currency,
    now,
    now
  ]);

  const peopleIds = input.people.map((name) => {
    const personId = createId("person");
    database.run("INSERT INTO people (id, session_id, name, created_at) VALUES (?, ?, ?, ?)", [personId, id, name, now]);
    return personId;
  });

  for (const item of input.items.length ? input.items : [{ name: "Receipt item", price: 0 }]) {
    database.run("INSERT INTO items (id, session_id, name, price, assigned_to, created_at) VALUES (?, ?, ?, ?, ?, ?)", [
      createId("item"),
      id,
      item.name,
      item.price,
      peopleIds[0] ?? null,
      now
    ]);
  }

  persist();
  return getSession(id);
}

export async function updateSession(id: string, input: Omit<SplitSession, "id" | "createdAt" | "updatedAt">) {
  const database = await getDb();
  const existing = await getSession(id);
  if (!existing) return null;
  const now = new Date().toISOString();

  database.run("UPDATE sessions SET title = ?, tax = ?, tip = ?, currency = ?, updated_at = ? WHERE id = ?", [
    input.title,
    input.tax,
    input.tip,
    input.currency,
    now,
    id
  ]);
  database.run("DELETE FROM items WHERE session_id = ?", [id]);
  database.run("DELETE FROM people WHERE session_id = ?", [id]);
  for (const person of input.people) {
    database.run("INSERT INTO people (id, session_id, name, created_at) VALUES (?, ?, ?, ?)", [person.id, id, person.name, now]);
  }
  const validPersonIds = new Set(input.people.map((person) => person.id));
  for (const item of input.items) {
    database.run("INSERT INTO items (id, session_id, name, price, assigned_to, created_at) VALUES (?, ?, ?, ?, ?, ?)", [
      item.id,
      id,
      item.name,
      item.price,
      item.assignedTo && validPersonIds.has(item.assignedTo) ? item.assignedTo : null,
      now
    ]);
  }

  persist();
  return getSession(id);
}

function select(database: Database, query: string, params: SqlValue[] = []) {
  const statement = database.prepare(query);
  statement.bind(params);
  const rows: Record<string, unknown>[] = [];
  while (statement.step()) rows.push(statement.getAsObject());
  statement.free();
  return rows;
}
