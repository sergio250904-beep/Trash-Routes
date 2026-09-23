import React, { useState } from 'react';

function Login({ onLoginExitoso }) {
  const [esRegistro, setEsRegistro] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [calle, setCalle] = useState('');
  const [cargando, setCargando] = useState(false);

  const callesCulturas = [
    "Calle Coahuiteca", "Calle Mixe", "Calle Mazateca", 
    "Calle Cora", "Calle Huichol", "Calle Tlapaneca"
  ];

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      if (esRegistro && !calle) {
        alert("Por favor selecciona tu calle.");
        setCargando(false);
        return;
      }

      // Preparamos los datos para enviarlos al PHP
      const payload = {
        accion: esRegistro ? 'registro' : 'login',
        usuario: usuario,
        password: password,
        calle: esRegistro ? calle : '' 
      };

      // Petición al servidor local XAMPP
      const respuesta = await fetch('http://18.220.253.245/login_usuario.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const resultado = await respuesta.json();

      if (resultado.status === 'exito') {
        onLoginExitoso({ nombre: resultado.usuario, direccion: resultado.direccion });
      } else {
        alert(resultado.mensaje);
      }

    } catch (error) {
      console.error("Error al procesar:", error);
      alert("Error al conectar con el servidor PHP.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '400px', width: '100%', backgroundColor: '#1e1e1e', borderRadius: '12px', textAlign: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}>
      <h2 style={{ marginTop: 0 }}>{esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
      
      <form onSubmit={manejarEnvio} style={{ textAlign: 'left' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>Usuario:</label>
          <input 
            type="text" placeholder="Ej. Sergio@gmail.com" value={usuario} 
            onChange={(e) => setUsuario(e.target.value)} required 
            style={{ width: '100%', padding: '12px', marginTop: '5px', backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #333', borderRadius: '6px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: esRegistro ? '15px' : '25px' }}>
          <label>Contraseña:</label>
          <input 
            type="password" placeholder="********" value={password} 
            onChange={(e) => setPassword(e.target.value)} required 
            style={{ width: '100%', padding: '12px', marginTop: '5px', backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #333', borderRadius: '6px', boxSizing: 'border-box' }}
          />
        </div>

        {esRegistro && (
          <div style={{ marginBottom: '25px' }}>
            <label>Selecciona tu calle:</label>
            <select 
              value={calle} 
              onChange={(e) => setCalle(e.target.value)} 
              required={esRegistro}
              style={{ width: '100%', padding: '12px', marginTop: '5px', backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #333', borderRadius: '6px', boxSizing: 'border-box' }}
            >
              <option value="">¿En qué calle vives?</option>
              {callesCulturas.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        <button type="submit" disabled={cargando} style={{ width: '100%', padding: '14px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          {cargando ? 'Cargando...' : (esRegistro ? 'Registrarse' : 'Ingresar')}
        </button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '14px', color: '#aaa' }}>
        {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'} 
        <span 
          onClick={() => setEsRegistro(!esRegistro)} 
          style={{ color: '#007bff', cursor: 'pointer', marginLeft: '5px', fontWeight: 'bold' }}
        >
          {esRegistro ? 'Inicia sesión aquí' : 'Regístrate aquí'}
        </span>
      </p>
    </div>
  );
}

export default Login;