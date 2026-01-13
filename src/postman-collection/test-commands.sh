echo "=== PRUEBAS MICROSERVICIO PRODUCTOS ==="
echo "Instrucción: Copia y pega CADA comando en una terminal"
echo ""

echo "1. Verificar que el servicio responde:"
echo 'echo {"cmd": "get_all_products"} | nc localhost 3003'
echo ""

echo "2. Crear un producto de prueba:"
cat << 'EOF'
echo '{
  "cmd": "create_product",
  "name": "Hamburguesa Demo",
  "description": "Producto de demostración",
  "price": 10.99,
  "stallId": "stall-demo-001",
  "category": "Comida Rápida",
  "stock": 100
}' | nc localhost 3003
EOF
echo ""

echo "3. Ver catálogo público:"
echo 'echo {"cmd": "get_public_catalog"} | nc localhost 3003'
echo ""

echo "=== FIN DE PRUEBAS ==="
echo "Nota: Postman no soporta TCP nativamente"
echo "Estos comandos deben ejecutarse en terminal con netcat/telnet"