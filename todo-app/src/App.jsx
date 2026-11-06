import { useState } from 'react';
import './App.css';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');

  const addTodo = () => {
    if (!text.trim()) return;
    setTodos([...todos, { id: Date.now(), text, done: false }]);
    setText('');
  };

  const toggle = (id) =>
    setTodos(todos.map(t => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id) => setTodos(todos.filter(t => t.id !== id));

  return (
    <div className="container">
      <h1>My TODO App</h1>
      <div className="add-row">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="What needs to be done?"
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul>
        {todos.map(t => (
          <li key={t.id}>
            <span
              onClick={() => toggle(t.id)}
              style={{ textDecoration: t.done ? 'line-through' : 'none', cursor: 'pointer' }}
            >
              {t.text}
            </span>
            <button onClick={() => remove(t.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <p>{todos.filter(t => !t.done).length} task(s) remaining</p>
    </div>
  );
}