import { useState } from 'react';
import { useUser } from './hooks/useUser';
import { useBoards } from './hooks/useBoards';
import { useTasks } from './hooks/useTasks';
import { login, register, logout } from './services/auth';
import { createBoard, deleteBoard } from './services/boards';
import { createTask, updateTaskStatus, deleteTask } from './services/tasks';
import Feed from './pages/Feed';

export default function App() {
  const user = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);

  // Tab-Verwaltung ("boards" oder "feed")
  const [currentTab, setCurrentTab] = useState('boards');

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
        <h1 
          className="text-xl font-bold text-slate-800 cursor-pointer flex items-center gap-2" 
          onClick={() => { setActiveBoardId(null); setCurrentTab('boards'); }}
        >
          <span>📌</span> To-Do Board & Feed
        </h1>

        {user && (
          <div className="flex items-center gap-6">
            {/* Navigation Tabs */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentTab('boards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentTab === 'boards' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📋 Boards
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('feed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentTab === 'feed' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✨ Feed
              </button>
            </div>

            <div className="flex items-center gap-3 border-l pl-4 border-slate-200">
              <span className="text-sm text-slate-600 font-medium">{user.email}</span>
              <button
                onClick={() => logout()}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Abmelden
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 max-w-4xl mx-auto w-full">
        {!user ? (
          /* Login / Register Form */
          <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md mx-auto mt-12 border border-slate-200">
            <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
              {isRegistering ? 'Registrieren' : 'Anmelden'}
            </h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-sm font-medium">{error}</div>}
            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Passwort</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl font-bold transition mt-2 cursor-pointer shadow-sm">
                {isRegistering ? 'Registrieren' : 'Anmelden'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-slate-600 hover:underline font-medium cursor-pointer">
                {isRegistering ? 'Bereits einen Account? Anmelden' : 'Noch kein Account? Registrieren'}
              </button>
            </div>
          </div>
        ) : currentTab === 'feed' ? (
          /* Social Feed Seite */
          <Feed user={user} />
        ) : !activeBoardId ? (
          /* Boards Ansicht */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Deine Boards</h2>
              <button
                type="button"
                onClick={() => setCurrentTab('feed')}
                className="sm:hidden bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
              >
                ✨ Zum Feed
              </button>
            </div>
            
            {/* Neues Board Erstellen Formular */}
            <form onSubmit={handleCreateBoard} className="flex gap-2 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <input
                type="text"
                placeholder="Neuer Board-Titel..."
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                className="flex-grow border border-slate-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer">
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
                    className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition flex justify-between items-center border border-slate-200 group"
                  >
                    <span className="font-bold text-slate-800 group-hover:text-teal-700 transition">{board.title}</span>
                    <button
                      onClick={(e) => handleDeleteBoard(board.id, e)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                    >
                      Löschen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Einzelne Board Aufgaben */
          <div>
            <button
              onClick={() => setActiveBoardId(null)}
              className="mb-4 text-slate-600 hover:text-slate-900 text-sm font-bold flex items-center gap-1 cursor-pointer"
            >
              &larr; Zurück zu allen Boards
            </button>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">Board-Aufgaben</h2>
            
            <form onSubmit={handleCreateTask} className="flex gap-2 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <input
                type="text"
                placeholder="Neue Aufgabe..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-grow border border-slate-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer">
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
                  <div key={task.id} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center border border-slate-200">
                    <span className={`font-medium text-sm ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-3">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="border border-slate-300 rounded-xl p-1.5 text-xs font-semibold bg-slate-50 cursor-pointer"
                      >
                        <option value="todo">Todo</option>
                        <option value="doing">Doing</option>
                        <option value="done">Done</option>
                      </select>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer px-2 py-1"
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

      {/* Footer */}
      <footer className="bg-white border-t p-4 text-center text-xs text-slate-500 font-medium">
        To-Do-Board & Feed App &copy; 2026
      </footer>
    </div>
  );
}