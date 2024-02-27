import './App.css';
import { useEffect, useState } from "react";

function App() {
  const [profile, setProfile] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [eventSource, setEventSource] = useState(null);

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (eventSource) {
      eventSource.close();
    }

    const newEventSource = new EventSource(`http://localhost:3001/events/watch?apiKey=${inputValue}`);
    newEventSource.onmessage = (event) => {
      const newProfile = event.data;
      setProfile(() => newProfile);
    };

    setEventSource(newEventSource);
  };

  return (
      <div className="App">
        <h1>Flexhire Frontend</h1>
        <form onSubmit={handleSubmit}>
          <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite a API Key"
          />
          <button type="submit">Load profile</button>
        </form>
        <span>{profile}</span>
      </div>
  );
}

export default App;
