const scanBtn = document.getElementById('scanBtn');
const connectBtn = document.getElementById('connectBtn');
const deviceListDiv = document.getElementById('deviceList');
const log = document.getElementById('log');

let foundDevices = [];
let connectedDevices = [];
const characteristicUUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

scanBtn.addEventListener('click', async () => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'CRONOPIC-F' }],
      optionalServices: [characteristicUUID]
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
    appendLog(`Error escaneando: ${error}`);
  }
});

connectBtn.addEventListener('click', async () => {
  for (const device of foundDevices) {
    try {
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(characteristicUUID);
      const characteristic = await service.getCharacteristic(characteristicUUID);

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = new TextDecoder().decode(event.target.value);
        appendLog(`${device.name}: ${value}`);
      });

      connectedDevices.push({ device, characteristic });
      appendLog(`Conectado a ${device.name}`);
    } catch (error) {
      appendLog(`Error conectando a ${device.name}: ${error}`);
    }
  }
});

function appendLog(text) {
  log.textContent += text + '\n';
}
