const scanBtn = document.getElementById('scanBtn');
const deviceListDiv = document.getElementById('deviceList');
const log = document.getElementById('log');

let connectedDevices = [];
const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

scanBtn.addEventListener('click', async () => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'CRONOPIC-F' }],
      optionalServices: [SERVICE_UUID]
    });

    const name = device.name || 'Unnamed';
    if (!/^CRONOPIC-F[1-9]$/.test(name)) {
      appendLog(`⚠️ Dispositivo no válido: ${name}`);
      return;
    }

    const div = document.createElement('div');
    div.textContent = `Conectando a ${name}...`;
    deviceListDiv.appendChild(div);

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);
    const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', (event) => {
      const value = new TextDecoder().decode(event.target.value);
      appendLog(`${name}: ${value}`);
    });

    connectedDevices.push({ device, characteristic });
    appendLog(`✅ Conectado a ${name}`);
    div.textContent = `✅ ${name} conectado`;

  } catch (error) {
    console.error(error);
    appendLog(`❌ ERROR: ${error.message}`);
  }
});

function appendLog(text) {
  log.textContent += text + '\n';
}
