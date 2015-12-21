var deviceClass =  require('./device.js').DeviceModule;
var device = new deviceClass('/dev/ttyUSB0',3);
device.init_device();
