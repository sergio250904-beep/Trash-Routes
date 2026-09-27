import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';  
import 'leaflet/dist/leaflet.css';

// Se mantiene como respaldo si el usuario no da permisos de GPS
const coordenadasCalles = {
  "Calle Coahuiteca": [25.841612, -97.456570],
  "Calle Mixe": [25.841166, -97.456618],
  "Calle Mazateca": [25.840741, -97.456548],
  "Calle Cora": [25.840240, -97.456543],
  "Calle Huichol": [25.839814, -97.456578],
  "Calle Tlapaneca": [25.839343, -97.4456628]
};

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
  
  // NUEVO: Estado para guardar la dirección exacta generada por el GPS
  const [direccionReporte, setDireccionReporte] = useState(direccion);

  // Efecto original de respaldo por si no usan el GPS
  useEffect(() => {
    const nombreCalle = direccion.split(",")[0].trim();
    if (coordenadasCalles[nombreCalle]) setCoordsCasa(coordenadasCalles[nombreCalle]);
  }, [direccion]);

  // NUEVA FUNCIÓN: Obtener ubicación exacta del navegador
  const obtenerUbicacionExacta = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (posicion) => {
          const lat = posicion.coords.latitude;
          const lng = posicion.coords.longitude;
          
          setCoordsCasa([lat, lng]); // Mueve el mapa a la coordenada exacta

          try {
            // Convierte las coordenadas del GPS en una dirección real (calle, colonia)
            const respuesta = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const datos = await respuesta.json();
            
            // Actualiza el texto que se enviará a AWS
            setDireccionReporte(datos.display_name); 
          } catch (error) {
            console.error("Error al obtener el nombre de la calle:", error);
            // Si falla la conversión, envía las coordenadas numéricas a AWS
            setDireccionReporte(`Coordenadas GPS: ${lat}, ${lng}`); 
          }
        },
        (error) => {
          console.error("Error de GPS:", error.message);
          alert("Por favor, permite el acceso a tu ubicación en tu navegador para fijar el punto exacto.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Tu navegador no soporta geolocalización.");
    }
  };

  const manejarQueja = async (e) => {
  e.preventDefault();
  if (!queja.trim()) return;

  try {
    // Llamamos a la variable desde el .env
    const urlBase = import.meta.env.VITE_API_URL;

    const respuesta = await fetch(`${urlBase}/guardar_ruta.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        punto_recoleccion: direccionReporte,
        zona: queja 
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
          <p style={{ margin: 0, color: '#aaa', fontSize: '14px', maxWidth: '350px' }}>
            Punto de reporte: {direccionReporte}
          </p>
          
          {/* NUEVO BOTÓN: Activa el GPS */}
          <button 
            onClick={obtenerUbicacionExacta} 
            type="button"
            style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
            📍 Usar mi ubicación exacta
          </button>
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
          
          {/* Este marcador ahora se mueve con el GPS */}
          <Marker position={coordsCasa}>
            <Popup><b>Punto de Recolección</b><br/>{direccionReporte}</Popup>
          </Marker>

          <Marker position={camionActivo.coordenadas_actuales} icon={iconoCamion}>
            <Popup><b>{camionActivo.id}</b><br/>Recolectando basura...</Popup>
          </Marker>

          <ActualizarCamara centro={coordsCasa} />
        </MapContainer>
      </div>

      {/* Quejas */}
      <div style={{ backgroundColor: '#2c2c2c', padding: '20px', borderRadius: '8px', border: '1px solid #444' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>⚠️ Levantar Reporte</h3>
        <form onSubmit={manejarQueja} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input type="text" value={queja} onChange={(e) => setQueja(e.target.value)} placeholder="Ej. El camión no pasó por mi calle..." required style={{ flex: 1, minWidth: '200px', padding: '12px', borderRadius: '6px', border: '1px solid #555', backgroundColor: '#1e1e1e', color: 'white' }} />
          <button type="submit" style={{ padding: '12px 20px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Enviar Reporte</button>
        </form>
      </div>

    </div>
  );
}

export default Mapa;