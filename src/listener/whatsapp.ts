import { Client, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { Application } from '@feathersjs/feathers';
import logger from '../logger';

// Create a new client instance
const client = new Client({
  puppeteer: {
    headless: false,
    devtools: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  }
});


export default function (app: Application): void {
  logger.info('WhatsApp listener starting');
  // When the client is ready, run this code (only once)
  client.once('ready', () => {
    console.log('Client is ready!');
  });

  // When the client received QR-Code
  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
  });

  client.on('message_create', async (message) => {
    if (message.body.includes('https://br.ifunny.co/video/')) {

      try {
        const videoUrl: String = message.body.substring(message.body.indexOf('https://br.ifunny.co/video/')).trim();
        const videoTrueUrl = await app.service('download').create({ link: videoUrl });
        const media = await MessageMedia.fromUrl(videoTrueUrl);
        await client.sendMessage(message.from, media);
        await client.sendMessage(message.from, '------------');
      } catch (error) {
        console.log(error);
        logger.error(error);
      }
      // send back "pong" to the chat the message was sent in
    }
  });

  // Start your client
  client.initialize();
  logger.info('WhatsApp listener started');
}


