const scanBtn = document.getElementById('scanBtn');
const deviceListDiv = document.getElementById('deviceList');
const log = document.getElementById('log');

let connectedDevices = [];
const TARGET_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

scanBtn.addEventListener('click', async () => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'CRONOPIC-F' }]
      // NO optionalServices
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
    const services = await server.getPrimaryServices();

    let found = false;

    for (const service of services) {
      const characteristics = await service.getCharacteristics();

      for (const char of characteristics) {
       if ((char.uuid.toLowerCase().includes('ffe1')) && char.properties.notify) {
          await char.startNotifications();
          char.addEventListener('characteristicvaluechanged', (event) => {
            const value = new TextDecoder().decode(event.target.value);
            appendLog(`${name}: ${value}`);
          });

          connectedDevices.push({ device, characteristic: char });
          appendLog(`✅ Conectado a ${name} (char: ${char.uuid})`);
          div.textContent = `✅ ${name} conectado`;
          found = true;
          break;
        }
      }

      if (found) break;
    }

    if (!found) {
      appendLog(`❌ ${name}: característica FFE1 no encontrada`);
      div.textContent = `❌ ${name}: sin FFE1`;
    }

  } catch (error) {
    console.error(error);
    appendLog(`❌ ERROR: ${error.message}`);
  }
});

function appendLog(text) {
  log.textContent += text + '\n';
}
