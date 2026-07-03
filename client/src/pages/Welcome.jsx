import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/welcome.css';

// welcome.php — knock-on-the-door intro screen
export default function Welcome() {
  const navigate = useNavigate();
  const [fading, setFading] = useState(false);

  function knock() {
    setFading(true);
    setTimeout(() => navigate('/login'), 200);
  }

  return (
    <div className="page-welcome">
    <div id="backgroundContainer">
      <img src="/pictures/door.jpeg" className={`background-door${fading ? ' fade-out' : ''}`} id="bgDoor" alt="" />
      <img src="/pictures/only-door.jpeg" className={`overlay-door${fading ? ' fade-out' : ''}`} id="overlayDoor" alt="Door" onClick={knock} />
      <div id="welcomeText" className={fading ? 'fade-out' : ''}>
        <h1>Welcome to <span className="logo">Property<span className="yellow">Finder</span></span></h1>
        <p>A place where you can Discover your dream home with ease.</p>
        <h2 className="yellow"><b>Knock on the door ;)</b></h2>
      </div>
    </div>
    </div>
  );
}
