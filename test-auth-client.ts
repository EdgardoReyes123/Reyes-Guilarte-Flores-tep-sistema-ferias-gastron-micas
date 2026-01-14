import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

async function testAuthService() {
  console.log('🧪 Probando Auth Microservice...\n');

  // Crear cliente NestJS Microservices
  const client = ClientProxyFactory.create({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3001,
    },
  });

  try {
    // Conectar el cliente
    await client.connect();
    console.log('✅ Cliente conectado\n');

    // 1. Health Check
    console.log('1. Probando Health Check...');
    try {
      const healthResponse = await firstValueFrom(
        client.send('auth.health', {}),
      );
      console.log('✅ Health Check exitoso:');
      console.log(JSON.stringify(healthResponse, null, 2));
    } catch (error) {
      console.log('❌ Error en Health Check:', error.message);
    }

    console.log('\n2. Probando Login...');
    try {
      const loginResponse = await firstValueFrom(
        client.send('auth.login', {
          email: 'admin@feria.com',
          password: 'admin123',
        }),
      );
      console.log('✅ Login exitoso:');
      console.log('   Usuario:', loginResponse.user.email);
      console.log(
        '   Token:',
        loginResponse.access_token.substring(0, 30) + '...',
      );

      // 3. Validar Token
      console.log('\n3. Validando Token...');
      const validateResponse = await firstValueFrom(
        client.send('auth.validate', {
          token: loginResponse.access_token,
        }),
      );
      console.log(
        '✅ Validación:',
        validateResponse.valid ? 'VÁLIDO' : 'INVÁLIDO',
      );
    } catch (error) {
      console.log('❌ Error en Login:', error.message);

      // Intentar registrar usuario
      console.log('\n4. Registrando usuario de prueba...');
      try {
        const timestamp = Date.now();
        const registerResponse = await firstValueFrom(
          client.send('auth.register', {
            email: `test${timestamp}@example.com`,
            password: 'Test123!',
            name: 'Test User',
          }),
        );
        console.log('✅ Registro exitoso:');
        console.log('   Usuario:', registerResponse.user.email);
      } catch (regError) {
        console.log('❌ Error en Registro:', regError.message);
      }
    }
  } catch (error) {
    console.log('❌ Error general:', error.message);
  } finally {
    // Cerrar conexión
    await client.close();
    console.log('\n🔌 Cliente desconectado');
  }
}

// Ejecutar pruebas
testAuthService().catch(console.error);
