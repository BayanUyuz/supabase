import { useUser } from './hooks/useUser';
import { useBoards } from './hooks/useBoards';
import { useTasks } from './hooks/useTasks';
import { login, register, logout } from './services/auth';
import { createBoard, deleteBoard } from './services/boards';
import { createTask, updateTaskStatus, deleteTask } from './services/tasks';
import { useState } from 'react';

export default function App() {
  const user = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);

 
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const { boards, loading: boardsLoading, error: boardsError, reload: reloadBoards } = useBoards();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks(activeBoardId);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    const { error: authError } = isRegistering 
      ? await register(email, password) 
      : await login(email, password);

    if (authError) setError(authError.message);
    else if (isRegistering) {
      alert('Registrierung erfolgreich! Bitte melden Sie sich an.');
      setIsRegistering(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    try {
      await createBoard(newBoardTitle);
      setNewBoardTitle('');
      reloadBoards();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteBoard = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteBoard(id);
      if (activeBoardId === id) setActiveBoardId(null);
      reloadBoards();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeBoardId) return;
    try {
      await createTask(activeBoardId, newTaskTitle);
      setNewTaskTitle('');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="bg-white shadow p-4 flex justify-between items-center px-8">
        <h1 className="text-xl font-bold text-slate-800 cursor-pointer" onClick={() => setActiveBoardId(null)}>
          📌 To-Do Board
        </h1>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user.email}</span>
            <button
              onClick={() => logout()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition"
            >
              Abmelden
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 max-w-4xl mx-auto w-full">
        {!user ? (
          /* Login / Register Form */
          <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md mx-auto mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
              {isRegistering ? 'Registrieren' : 'Anmelden'}
            </h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Passwort</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-medium transition mt-2">
                {isRegistering ? 'Registrieren' : 'Anmelden'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-blue-600 hover:underline">
                {isRegistering ? 'Bereits einen Account? Anmelden' : 'Noch kein Account? Registrieren'}
              </button>
            </div>
          </div>
        ) : !activeBoardId ? (
          /* Boards Ansicht */
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Deine Boards</h2>
            
            {/* Yeni Board Ekleme Formu */}
            <form onSubmit={handleCreateBoard} className="flex gap-2 mb-6">
              Neues Board erstellen:
              <input
                type="text"
                placeholder="Board Titel..."
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                className="flex-grow border border-slate-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">
                Erstellen
              </button>
            </form>

            {boardsLoading ? (
              <p className="text-slate-500">Lade Boards...</p>
            ) : boardsError ? (
              <p className="text-red-500">{boardsError}</p>
            ) : boards.length === 0 ? (
              <p className="text-slate-500">Noch keine Boards vorhanden.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {boards.map((board) => (
                  <div
                    key={board.id}
                    onClick={() => setActiveBoardId(board.id)}
                    className="bg-white p-4 rounded-xl shadow hover:shadow-md cursor-pointer transition flex justify-between items-center border border-slate-200"
                  >
                    <span className="font-semibold text-slate-800">{board.title}</span>
                    <button
                      onClick={(e) => handleDeleteBoard(board.id, e)}
                      className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                    >
                      Löschen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
         
          <div>
            <button
              onClick={() => setActiveBoardId(null)}
              className="mb-4 text-blue-600 hover:underline text-sm font-medium"
            >
              &larr; Zurück zu allen Boards
            </button>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">Board Aufgaben</h2>

            
            <form onSubmit={handleCreateTask} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Neue Aufgabe..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-grow border border-slate-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition">
                Hinzufügen
              </button>
            </form>

            {tasksLoading ? (
              <p className="text-slate-500">Lade Aufgaben...</p>
            ) : tasksError ? (
              <p className="text-red-500">{tasksError}</p>
            ) : tasks.length === 0 ? (
              <p className="text-slate-500">Noch keine Aufgaben in diesem Board.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center border border-slate-200">
                    <span className={`font-medium ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-3">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="border border-slate-300 rounded p-1 text-sm bg-slate-50"
                      >
                        <option value="todo">Todo</option>
                        <option value="doing">Doing</option>
                        <option value="done">Done</option>
                      </select>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

   
      <footer className="bg-white border-t p-4 text-center text-sm text-slate-500">
        To-Do-Board App &copy; 2026
      </footer>
    </div>
  );
}