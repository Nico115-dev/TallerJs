export const obtenerSimulaciones = async () => {
    try {
        const response = await fetch('http://localhost:3000/simulaciones');
        if (!response.ok) {
            throw new Error('Error al obtener las simulaciones');
        }
        return await response.json();
    } catch (error) {
        console.error('Error al obtener simulaciones:', error);
        return [];
    }
};

export const guardarSimulacion = async (simulacion) => {
    try {
        const response = await fetch('http://localhost:3000/simulaciones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(simulacion),
        });
        if (!response.ok) {
            throw new Error('Error al guardar la simulación');
        }
        return await response.json(); 
    } catch (error) {
        console.error('Error al guardar la simulación:', error);
        return null;
    }
};
