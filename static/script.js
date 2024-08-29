async function cargarDatosIniciales() {
    try {
        const response = await fetch('/get_operarios_puestos');
        const data = await response.json();

        const selectOperarios = document.getElementById('operario');
        data.operarios.forEach(operario => {
            let option = document.createElement('option');
            option.value = operario;
            option.text = operario;
            selectOperarios.appendChild(option);
        });

        const selectPuestos = document.getElementById('puesto');
        data.puestos.forEach(puesto => {
            let option = document.createElement('option');
            option.value = puesto;
            option.text = puesto;
            selectPuestos.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
}

document.addEventListener('DOMContentLoaded', cargarDatosIniciales);

// Función para registrar la entrada de una pieza
async function registrarEntrada() {
    const codigo = document.getElementById('codigo').value;
    const operario = document.getElementById('operario').value;
    const puesto = document.getElementById('puesto').value;

 console.log("funciona");

   
    const data = {
        codigo: codigo,
        operario: operario,
        puesto: puesto
    };

    try {
        const response = await fetch('/registrar_entrada', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            obtenerPiezas();
        } else {
            console.error('Error al registrar la entrada:', await response.text());
        }
    } catch (error) {
        console.error('Error:', error);
    }
    console.log("Datos enviados para registro de entrada:", data);

}

// Función para registrar la salida de una pieza
async function registrarSalida() {
    const codigo = document.getElementById('codigo').value;
    const operario = document.getElementById('operario').value;
    const puesto = document.getElementById('puesto').value;

    const data = {
        codigo: codigo,
        operario: operario,
        puesto: puesto
    };

    try {
        const response = await fetch('/registrar_salida', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            obtenerPiezas();
        } else {
            console.error('Error al registrar la salida:', await response.text());
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para marcar un lote como terminado
async function marcarLoteTerminado() {
    const codigo = document.getElementById('codigo').value;

    try {
        const response = await fetch('/lote_terminado', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ codigo: codigo })
        });

        if (response.ok) {
            obtenerPiezas();
        } else {
            console.error('Error al marcar el lote como terminado:', await response.text());
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para obtener todas las piezas y mostrarlas en la tabla
async function obtenerPiezas() {
    try {
        const response = await fetch('/obtener_piezas');

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error al obtener las piezas:', errorText);
            return;
        }

        const piezas = await response.json();
        const tabla = document.getElementById('tabla-movimientos').getElementsByTagName('tbody')[0];
        tabla.innerHTML = '';

        piezas.forEach(pieza => {
            const fila = tabla.insertRow();

            fila.insertCell(0).textContent = pieza.codigo;
            fila.insertCell(1).textContent = pieza.puesto_actual;
            fila.insertCell(2).textContent = new Date(pieza.entrada).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
            fila.insertCell(3).textContent = pieza.salida ? new Date(pieza.salida).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }) : '';
            fila.insertCell(4).textContent = pieza.operario_entrada;
            fila.insertCell(5).textContent = pieza.acotacion || ''; 

            // Columna de acciones
            const accionesCell = fila.insertCell(6); 
            const observacionesButton = document.createElement('button');
            observacionesButton.textContent = 'Observaciones';
            observacionesButton.onclick = () => agregarObservacion(pieza.id);
            accionesCell.appendChild(observacionesButton);

            const eliminarButton = document.createElement('button');
            eliminarButton.textContent = 'Eliminar';
            eliminarButton.classList.add('delete'); 
            eliminarButton.onclick = () => eliminarPieza(pieza.id);
            accionesCell.appendChild(eliminarButton);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para agregar observación a una pieza
function agregarObservacion(piezaId) {
    const observacion = prompt('Ingrese la observación:');
    if (observacion) {
        fetch('/agregar_observacion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: piezaId, observacion: observacion })
        })
        .then(response => {
            if (response.ok) {
                obtenerPiezas();
            } else {
                console.error('Error al agregar la observación:', response.statusText);
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

// Función para eliminar una pieza
function eliminarPieza(piezaId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta pieza?')) {
        fetch('/eliminar_pieza', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: piezaId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('Pieza eliminada correctamente');
                obtenerPiezas();  // Actualizar la lista de piezas
            } else {
                console.error('Error al eliminar la pieza:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

// Inicializar la tabla al cargar la página
document.addEventListener('DOMContentLoaded', obtenerPiezas);

