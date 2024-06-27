import React, { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/hello/") //http://localhost:8000/
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((data) => {
        setMessage(data);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>{message}</p>
      </header>
    </div>
  );
}

export default App;
