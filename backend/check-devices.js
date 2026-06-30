import mongoose from 'mongoose';
import Device from './src/models/Device.model.js';

mongoose.connect('mongodb://localhost:27017/beatly').then(async () => {
  const devices = await Device.find();
  console.log(devices);
  process.exit(0);
});
