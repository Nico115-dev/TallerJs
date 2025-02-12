import { obtenerSimulaciones, guardarSimulacion } from '../utils/iService.js';

class SimuladorPrestamo extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        // HTML para el formulario y la tabla
        this.shadowRoot.innerHTML = /*html*/`
        <style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background-color: #f4f7fc;
    color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh; 
    padding: 0;
    margin: 0;
}

.container {
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 90%;
    max-width: 800px; 
    padding: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-left:550px
}


/* Títulos */
h1 {
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 30px;
}

h2 {
    font-size: 1.5rem;
    color: #4a4a4a;
    margin-bottom: 20px;
}

/* Formulario */
form {
    display: grid;
    gap: 15px;
    width: 100%;
    max-width: 500px;
    margin-bottom: 30px;
}

label {
    font-size: 1.1rem;
    color: #555;
}

input, select {
    padding: 12px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #f9f9f9;
    transition: border-color 0.3s ease;
    width: 100%;
}

input:focus, select:focus {
    border-color: #007bff;
    outline: none;
    background-color: #ffffff;
}

button {
    padding: 12px;
    font-size: 1.2rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #0056b3;
}

/* Historial de Simulaciones */
#history {
    margin-top: 30px;
    padding: 15px;
    background-color: #f1f1f1;
    border-radius: 8px;
    width: 100%; /* Asegura que el historial ocupe todo el ancho disponible */
}

#history div {
    padding: 8px;
    border-bottom: 1px solid #ccc;
    color: #333;
}

#history div:last-child {
    border-bottom: none;
}

/* Tabla de Amortización */
table {
    width: 100%;
    margin-top: 40px;
    border-collapse: collapse;
    text-align: center;
}

th, td {
    padding: 12px;
    font-size: 1rem;
    border: 1px solid #ddd;
}

th {
    background-color: #007bff;
    color: white;
}

td {
    background-color: #f9f9f9;
}

td:first-child {
    font-weight: bold;
}

tr:hover td {
    background-color: #f1f1f1;
}
        </style>

        <div class="container">
            <h1>Simulador de Préstamo Bancario</h1>
            <form id="loanForm">
                <label for="nombre">Nombre</label>
                <input type="text" id="nombre" required>

                <label for="documento">Documento de Identidad</label>
                <input type="text" id="documento" required>

                <label for="monto">Monto del Préstamo ($)</label>
                <input type="number" id="monto" required>

                <label for="tasa">Tasa de Interés Anual (%)</label>
                <input type="number" id="tasa" required>

                <label for="plazo">Plazo en Meses</label>
                <input type="number" id="plazo" required>

                <label for="tipo">Tipo de Amortización</label>
                <select id="tipo">
                    <option value="frances">Francés</option>
                    <option value="americano">Americano</option>
                </select>

                <button type="submit" id="calcular">Calcular</button>
            </form>

            <h2>Historial de Simulaciones</h2>
            <div id="history"></div>

            <h2>Tabla de Amortización</h2>
            <table id="amortizationTable">
                <thead>
                    <tr>
                        <th>Número de Cuota</th>
                        <th>Saldo Inicial</th>
                        <th>Cuota Mensual</th>
                        <th>Intereses</th>
                        <th>Amortización Capital</th>
                        <th>Saldo Restante</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>`;
    }

    addEventListeners() {
        const form = this.shadowRoot.getElementById('loanForm');
        form.addEventListener('submit', this.onSubmit.bind(this));

        this.cargarHistorial();
    }

    onSubmit(event) {
        event.preventDefault();
        
        const nombre = this.shadowRoot.getElementById('nombre').value;
        const documento = this.shadowRoot.getElementById('documento').value;
        const monto = parseFloat(this.shadowRoot.getElementById('monto').value);
        const tasa = parseFloat(this.shadowRoot.getElementById('tasa').value) / 100;
        const plazo = parseInt(this.shadowRoot.getElementById('plazo').value);
        const tipo = this.shadowRoot.getElementById('tipo').value;
        
        console.log('Datos recibidos:', { nombre, documento, monto, tasa, plazo, tipo });
    
        const tabla = this.calcularAmortizacion(monto, tasa, plazo, tipo);
    
        console.log('Tabla de amortización:', tabla); // Verifica que la tabla esté calculada correctamente
    
        this.mostrarTabla(tabla);
        
        const cliente = { nombre, documento, tabla, fecha: new Date().toLocaleString() };
        console.log('Cliente a guardar:', cliente);
    
        this.guardarHistorial(cliente);
    }
    

    calcularAmortizacion(monto, tasa, plazo, tipo) {
        let saldo = monto;
        let tabla = [];

        if (tipo === 'frances') {
            const cuota = (monto * (tasa / 12)) / (1 - Math.pow(1 + tasa / 12, -plazo));

            for (let i = 1; i <= plazo; i++) {
                const intereses = saldo * tasa / 12;
                const amortizacion = cuota - intereses;
                saldo -= amortizacion;

                tabla.push({
                    numero: i,
                    saldoInicial: saldo + amortizacion,
                    cuotaMensual: cuota.toFixed(2),
                    intereses: intereses.toFixed(2),
                    amortizacionCapital: amortizacion.toFixed(2),
                    saldoRestante: saldo.toFixed(2),
                });
            }
        } else if (tipo === 'americano') {
            const cuotaIntereses = monto * tasa / 12;

            for (let i = 1; i <= plazo; i++) {
                const intereses = monto * tasa / 12;
                if (i === plazo) {
                    saldo = 0;
                }

                tabla.push({
                    numero: i,
                    saldoInicial: monto,
                    cuotaMensual: (i === plazo ? monto + intereses : cuotaIntereses).toFixed(2),
                    intereses: intereses.toFixed(2),
                    amortizacionCapital: (i === plazo ? monto : 0).toFixed(2),
                    saldoRestante: saldo.toFixed(2),
                });
            }
        }

        return tabla;
    }

    mostrarTabla(tabla) {
        const amortizationTableBody = this.shadowRoot.querySelector('#amortizationTable tbody');
        amortizationTableBody.innerHTML = '';
    
        tabla.forEach(fila => {
            const row = document.createElement('tr');
            Object.values(fila).forEach(valor => {
                const cell = document.createElement('td');
                cell.textContent = valor;
                row.appendChild(cell);
            });
            amortizationTableBody.appendChild(row);
        });
    }
    
    

    async guardarHistorial(cliente) {
        await guardarSimulacion(cliente);
        this.cargarHistorial();
    }

    async cargarHistorial() {
        try {
            const simulaciones = await obtenerSimulaciones();
            console.log('Simulaciones obtenidas:', simulaciones);
    
            const historyDiv = this.shadowRoot.getElementById('history');
            historyDiv.innerHTML = '';
    
            if (simulaciones.length === 0) {
                historyDiv.innerHTML = 'No hay simulaciones guardadas.';
            }
    
            simulaciones.forEach(simulacion => {
                console.log('Simulacion:', simulacion);
                
                const div = document.createElement('div');
                div.textContent = `${simulacion.fecha} - ${simulacion.nombre} (${simulacion.documento})`;
                historyDiv.appendChild(div);
    
                this.mostrarTablaReal(simulacion.tabla);
            });
        } catch (error) {
            console.error('Error al cargar el historial:', error);
        }
    }
    
    mostrarTablaReal(tabla) {
        const amortizationTableBody = this.shadowRoot.querySelector('#amortizationTable tbody');
        amortizationTableBody.innerHTML = '';
        
        tabla.forEach(fila => {
            const row = document.createElement('tr');
            
            Object.values(fila).forEach(valor => {
                const cell = document.createElement('td');
                cell.textContent = valor;
                row.appendChild(cell);
            });
    
            amortizationTableBody.appendChild(row);
        });
    }
    
    
    
    
}

customElements.define('simulador-prestamo', SimuladorPrestamo);
