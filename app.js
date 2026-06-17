const DB_KEY = 'gym_tracker_data';
let db = JSON.parse(localStorage.getItem(DB_KEY)) || {
    diasPorSemana: 0,
    poolEjercicios: ['Prensa Inclinada', 'Zancadas'],
    semanaActual: {},
    semanaSiguiente: {}
};

let diaSeleccionado = null; // Para saber a qué día le estamos agregando un ejercicio

function guardarDB() {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    render();
}

function init() {
    if (db.diasPorSemana === 0) {
        document.getElementById('setup-screen').classList.remove('hidden');
        document.getElementById('main-screen').classList.add('hidden');
    } else {
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('main-screen').classList.remove('hidden');
        render();
    }
}

function guardarDias() {
    const dias = parseInt(document.getElementById('dias-input').value);
    if (dias > 0 && dias <= 7) {
        db.diasPorSemana = dias;
        // Inicializar los días
        for(let i = 1; i <= dias; i++) {
            if(!db.semanaActual[`dia${i}`]) db.semanaActual[`dia${i}`] = [];
            if(!db.semanaSiguiente[`dia${i}`]) db.semanaSiguiente[`dia${i}`] = [];
        }
        guardarDB();
        init();
    }
}

function render() {
    const container = document.getElementById('dias-container');
    container.innerHTML = '';

    for (let i = 1; i <= db.diasPorSemana; i++) {
        const diaKey = `dia${i}`;
        const ejercicios = db.semanaActual[diaKey] || [];
        
        let html = `<div class="card">
            <h3>Día ${i}</h3>`;
        
        ejercicios.forEach((ej, indexEj) => {
            html += `<div><strong>${ej.nombre}</strong><br>`;
            // Generar inputs para cada serie
            for (let s = 0; s < ej.series; s++) {
                const valor = ej.repeticiones[s] || '';
                html += `<input type="number" class="rep-box" value="${valor}" 
                          placeholder="Reps" 
                          onchange="actualizarRep('${diaKey}', ${indexEj}, ${s}, this.value)">`;
            }
            html += `</div>`;
        });

        html += `<button onclick="abrirAgregarEjercicio('${diaKey}')">+ Agregar Ejercicio</button></div>`;
        container.innerHTML += html;
    }
}

// Actualiza el array de repeticiones on-the-fly
function actualizarRep(diaKey, indexEj, serieIndex, valor) {
    db.semanaActual[diaKey][indexEj].repeticiones[serieIndex] = parseInt(valor) || 0;
    guardarDB();
}

function abrirAgregarEjercicio(diaKey) {
    diaSeleccionado = diaKey;
    const select = document.getElementById('pool-select');
    select.innerHTML = '<option value="">-- Elegir del Pool --</option>';
    db.poolEjercicios.forEach(ej => {
        select.innerHTML += `<option value="${ej}">${ej}</option>`;
    });
    
    document.getElementById('add-exercise-screen').classList.remove('hidden');
}

function confirmarEjercicio() {
    const nombreInput = document.getElementById('nuevo-ejercicio').value;
    const nombreSelect = document.getElementById('pool-select').value;
    const series = parseInt(document.getElementById('series-input').value);

    let nombreFinal = nombreInput || nombreSelect;

    if (!nombreFinal || !series) return alert('Completa nombre y series');

    // Agregar al pool si es nuevo
    if (nombreInput && !db.poolEjercicios.includes(nombreInput)) {
        db.poolEjercicios.push(nombreInput);
    }

    // Agregar al día seleccionado
    db.semanaActual[diaSeleccionado].push({
        nombre: nombreFinal,
        series: series,
        repeticiones: new Array(series).fill('') // Array vacío de tamaño 'series'
    });

    // Limpiar modal
    document.getElementById('nuevo-ejercicio').value = '';
    document.getElementById('series-input').value = '';
    cerrarModales();
    guardarDB();
}

function cerrarModales() {
    document.getElementById('add-exercise-screen').classList.add('hidden');
}

// Función estrella: Clonar rutina limpiando los números de repeticiones
function copiarSemanaAnterior() {
    if(confirm('¿Sobrescribir la semana actual con la estructura de la semana anterior?')) {
        // En una app real de producción, tendrías un historial. 
        // Aquí pasamos la "actual" a ser un "template"
        for (let i = 1; i <= db.diasPorSemana; i++) {
            const diaKey = `dia${i}`;
            const rutinaAnterior = db.semanaActual[diaKey];
            
            // Clonamos profundamente y limpiamos las reps
            const rutinaNueva = rutinaAnterior.map(ej => ({
                nombre: ej.nombre,
                series: ej.series,
                repeticiones: new Array(ej.series).fill('')
            }));
            
            db.semanaActual[diaKey] = rutinaNueva;
        }
        guardarDB();
    }
}

// Arrancar la app
init();