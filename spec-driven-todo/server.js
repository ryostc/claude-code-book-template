const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new Database(path.join(__dirname, 'tasks.db'));

// テーブル初期化
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    text  TEXT    NOT NULL,
    done  INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )
`);

app.use(express.json());
app.use(express.static(__dirname));

// 全タスク取得
app.get('/api/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
  res.json(tasks.map(t => ({ ...t, done: t.done === 1 })));
});

// タスク追加
app.post('/api/tasks', (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'text is required' });
  const result = db.prepare('INSERT INTO tasks (text) VALUES (?)').run(text.trim());
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...task, done: task.done === 1 });
});

// タスク更新 (done切り替え)
app.patch('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { done } = req.body;
  db.prepare('UPDATE tasks SET done = ? WHERE id = ?').run(done ? 1 : 0, id);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) return res.status(404).json({ error: 'not found' });
  res.json({ ...task, done: task.done === 1 });
});

// タスク削除
app.delete('/api/tasks/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// 完了済み一括削除
app.delete('/api/tasks', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE done = 1').run();
  res.status(204).end();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
