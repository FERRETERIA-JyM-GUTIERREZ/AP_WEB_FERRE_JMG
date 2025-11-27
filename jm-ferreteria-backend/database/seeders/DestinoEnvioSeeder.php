<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DestinoEnvio;

class DestinoEnvioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar la tabla antes de sembrar
        DestinoEnvio::query()->delete();

        $destinos = [
            // DESTINOS AÉREOS
            ['nombre' => 'Arequipa', 'costo' => 25.00, 'tipo_envio' => 'aereo'],
            ['nombre' => 'Ayacucho', 'costo' => 23.00, 'tipo_envio' => 'aereo'],
            ['nombre' => 'Cajamarca', 'costo' => 24.00, 'tipo_envio' => 'aereo'],
            ['nombre' => 'Chiclayo', 'costo' => 23.00, 'tipo_envio' => 'aereo'],
            ['nombre' => 'Cusco', 'costo' => 28.00, 'tipo_envio' => 'aereo'],
            ['nombre' => 'Huanta', 'costo' => 26.00, 'tipo_envio' => 'aereo'],
            ['nombre' => 'Iquitos', 'costo' => 35.00, 'tipo_envio' => 'aereo'],
            ['nombre' => 'Lamas', 'costo' => 32.00, 'tipo_envio' => 'aereo'],
            ['nombre' => 'Lima', 'costo' => 15.00, 'tipo_envio' => 'aereo'],
            ['nombre' => 'Piura', 'costo' => 26.00, 'tipo_envio' => 'aereo'],
            ['nombre' => 'Pto. Maldonado', 'costo' => 38.00, 'tipo_envio' => 'aereo'],
            ['nombre' => 'Pucallpa', 'costo' => 33.00, 'tipo_envio' => 'aereo'],
            ['nombre' => 'Tacna', 'costo' => 27.00, 'tipo_envio' => 'aereo'],
            ['nombre' => 'Tarapoto', 'costo' => 30.00, 'tipo_envio' => 'aereo'],
            ['nombre' => 'Trujillo', 'costo' => 22.00, 'tipo_envio' => 'aereo'],
            ['nombre' => 'Tumbes', 'costo' => 30.00, 'tipo_envio' => 'aereo'],
            ['nombre' => 'Yurimaguas', 'costo' => 36.00, 'tipo_envio' => 'aereo'],

            // DESTINOS TERRESTRES
            ['nombre' => 'Ica', 'costo' => 18.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Huancayo', 'costo' => 20.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Huánuco', 'costo' => 22.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Chimbote', 'costo' => 19.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Pisco', 'costo' => 17.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Tingo María', 'costo' => 25.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Huacho', 'costo' => 16.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Cañete', 'costo' => 15.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Barranca', 'costo' => 17.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Cerro de Pasco', 'costo' => 24.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Chincha', 'costo' => 16.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Chupaca', 'costo' => 21.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Concepción', 'costo' => 22.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Jauja', 'costo' => 23.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'La Oroya', 'costo' => 20.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Abancay', 'costo' => 30.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Andahuaylas', 'costo' => 32.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Bagua Grande', 'costo' => 35.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Bambamarca', 'costo' => 28.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Chachapoyas', 'costo' => 29.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Chota', 'costo' => 27.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Ilo', 'costo' => 18.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Jaén', 'costo' => 33.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Moquegua', 'costo' => 25.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Moyobamba', 'costo' => 34.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Nueva Cajamarca', 'costo' => 26.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Pedro Ruiz', 'costo' => 31.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Puno', 'costo' => 28.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Sicuani', 'costo' => 29.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Sullana', 'costo' => 24.00, 'tipo_envio' => 'terrestre'],
            ['nombre' => 'Talara', 'costo' => 22.00, 'tipo_envio' => 'terrestre']
        ];

        foreach ($destinos as $destino) {
            DestinoEnvio::create([
                'nombre' => $destino['nombre'],
                'costo' => $destino['costo'],
                'terminal' => 'Se coordina por WhatsApp', // Valor genérico
                'direccion_terminal' => 'Se coordina por WhatsApp', // Valor genérico
                'telefono_terminal' => 'Se coordina por WhatsApp', // Valor genérico
                'horarios' => ['Se coordina por WhatsApp'], // Valor genérico
                'activo' => true,
                'tipo_envio' => $destino['tipo_envio']
            ]);
        }
    }
}
