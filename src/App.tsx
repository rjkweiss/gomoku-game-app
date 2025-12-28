import { useState, useEffect } from 'react';
import './App.css';
import { api } from './services/api';

function App() {

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.getAllUsers();
        console.log("data: ", data)
        setUsers(data.allUsers);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="app-wrapper">
      <h1>Hello Gamers!</h1>
      <p>Current System Users: {users.length}</p>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.firstName} {user.lastName}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
