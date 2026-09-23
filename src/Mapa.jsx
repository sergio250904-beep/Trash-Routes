import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';  
import 'leaflet/dist/leaflet.css';

const coordenadasCalles = {
  "Calle Coahuiteca": [25.841612, -97.456570],
  "Calle Mixe": [25.841166, -97.456618],
  "Calle Mazateca": [25.840741, -97.456548],
  "Calle Cora": [25.840240, -97.456543],
  "Calle Huichol": [25.839814, -97.456578],
  "Calle Tlapaneca": [25.839343, -97.4456628]
};

// SOLUCIÓN: Usamos un emoji convertido en marcador de mapa (nunca se va a romper)
const iconoCamion = new L.divIcon({
  html: '<div style="font-size: 35px; line-height: 1; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">🚛</div>',
  className: 'custom-div-icon',
  iconSize: [35, 35],
  iconAnchor: [17, 17]
});

const camionActivo = {
  id: "Unidad-01",
  estado: "Activo (En Ruta)",
  coordenadas_actuales: [25.838582, -97.457561], 
  horario: "Lun, Mié, Vie | 19:00 - 21:00"
};

function ActualizarCamara({ centro }) {
  const map = useMap();
  useEffect(() => { map.flyTo(centro, 16, { animate: true, duration: 1.5 }); }, [centro, map]);
  return null;
}

function Mapa({ nombre, direccion, onCerrarSesion }) {
  const [coordsCasa, setCoordsCasa] = useState([25.8438, -97.4533]); 
  const [queja, setQueja] = useState('');

  useEffect(() => {
    const nombreCalle = direccion.split(",")[0].trim();
    if (coordenadasCalles[nombreCalle]) setCoordsCasa(coordenadasCalles[nombreCalle]);
  }, [direccion]);

  const manejarQueja = async (e) => {
    e.preventDefault();
    if (!queja.trim()) return;

    try {
      // Petición al servidor local XAMPP (PHP)
      const respuesta = await fetch('http://3.137.150.65/guardar_ruta.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          punto_recoleccion: direccion, // Mandamos la dirección del usuario
          zona: queja                   // Mandamos la queja como dato
        })
      });

      const resultado = await respuesta.json();
      
      if (resultado.status === 'exito') {
        alert("Tu reporte ha sido enviado a AWS exitosamente.");
        setQueja(''); 
      } else {
        alert("Error del servidor: " + resultado.mensaje);
      }
    } catch (error) { 
      alert("Hubo un error al conectar con el servidor PHP.");
      console.error(error);
    }
  };

  return (
    <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '12px', width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Panel Superior */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0' }}>Hola, {nombre}</h2>
          <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>{direccion}</p>
        </div>
        
        <div style={{ backgroundColor: '#2c2c2c', padding: '10px 15px', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
          <b style={{ color: '#28a745' }}>{camionActivo.id} - {camionActivo.estado}</b>
          <p style={{ margin: '5px 0 0 0', fontSize: '13px' }}>⏰ Horario: {camionActivo.horario}</p>
        </div>

        <button onClick={onCerrarSesion} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Salir</button>
      </div>
      
      {/* MAPA */}
      <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '2px solid #333' }}>
        <MapContainer center={coordsCasa} zoom={16} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          
          <Marker position={coordsCasa}>
            <Popup><b>Tu Casa</b></Popup>
          </Marker>

          {/* Aquí se dibuja el camión de basura */}
          <Marker position={camionActivo.coordenadas_actuales} icon={iconoCamion}>
            <Popup><b>{camionActivo.id}</b><br/>Recolectando basura...</Popup>
          </Marker>

          <ActualizarCamara centro={coordsCasa} />
        </MapContainer>
      </div>

      {/* Quejas */}
      <div style={{ backgroundColor: '#2c2c2c', padding: '20px', borderRadius: '8px', border: '1px solid #444' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>⚠️ Levantar Reporte</h3>
        <form onSubmit={manejarQueja} style={{ display: 'flex', gap: '10px' }}>
          <input type="text" value={queja} onChange={(e) => setQueja(e.target.value)} placeholder="Ej. El camión no pasó..." required style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #555', backgroundColor: '#1e1e1e', color: 'white' }} />
          <button type="submit" style={{ padding: '12px 20px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Enviar</button>
        </form>
      </div>

    </div>
  );
}

export default Mapa;