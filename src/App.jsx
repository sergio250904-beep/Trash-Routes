import React, { useState } from 'react';
import Login from './Login';
import Mapa from './Mapa';

function App() {
  const [usuario, setUsuario] = useState(null);

  // Al poner el usuario en null, React vuelve a mostrar el Login
  const cerrarSesion = () => {
    setUsuario(null);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      minHeight: '100vh', width: '100%', backgroundColor: '#121212', color: 'white', padding: '20px'
    }}>
      <h1 style={{ marginBottom: '30px' }}>🚛 Trash Routes</h1>
      
      {!usuario ? (
        <Login onLoginExitoso={(datos) => setUsuario(datos)} />
      ) : (
        <Mapa 
          nombre={usuario.nombre} 
          direccion={usuario.direccion} 
          onCerrarSesion={cerrarSesion} 
        />
      )}
    </div>
  );
}

export default App;