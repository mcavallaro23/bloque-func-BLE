const scanBtn = document.getElementById('scanBtn');
const connectBtn = document.getElementById('connectBtn');
const deviceListDiv = document.getElementById('deviceList');
const log = document.getElementById('log');

let foundDevices = [];
let connectedDevices = [];

scanBtn.addEventListener('click', async () => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'CRONOPIC-F' }],
      optionalServices: ['generic_access'] // por compatibilidad
    });

    const name = device.name || 'Unnamed';
    if (/^CRONOPIC-F[1-9]$/.test(name)) {
      foundDevices.push(device);
      const div = document.createElement('div');
      div.textContent = name;
      deviceListDiv.appendChild(div);
    }
  } catch (error) {
    console.error(error);
    appendLog(`ERROR ESCANEANDO: ${error}`);
  }
});

connectBtn.addEventListener('click', async () => {
  for (const device of foundDevices) {
    try {
      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();

      for (const service of services) {
        const characteristics = await service.getCharacteristics();

        for (const char of characteristics) {
          if (char.properties.notify) {
            await char.startNotifications();
            char.addEventListener('characteristicvaluechanged', (event) => {
              const value = new TextDecoder().decode(event.target.value);
              appendLog(`${device.name}: ${value}`);
            });

            connectedDevices.push({ device, characteristic: char });
            appendLog(`✅ Conectado a ${device.name} (servicio: ${service.uuid})`);
            break;
          }
        }
      }
    } catch (error) {
      appendLog(`❌ ERROR CONECTANDO A ${device.name}: ${error}`);
    }
  }
});

function appendLog(text) {
  log.textContent += text + '\n';
}
