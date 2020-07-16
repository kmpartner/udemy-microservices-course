import nats = require('node-nats-streaming');
// import { Message, Stan } from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  // url: 'http://localhost:4222'
  url: 'http://127.0.0.1:4222'
});

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  new TicketCreatedListener(stan).listen();

  // const options = stan
  //   .subscriptionOptions()
  //   .setManualAckMode(true)
  //   .setDeliverAllAvailable()
  //   .setDurableName('accounting-service');
  
  // const subscription = stan.subscribe(
  //   'ticket:created',
  //   'queue-group-name',
  //   options
  // );

  // subscription.on('message', (msg: Message) => {
  //   // console.log('Message recieved');
  //   const data = msg.getData();

  //   if (typeof data === 'string') {
  //     console.log(
  //       `Received event #${msg.getSequence()}, with data: ${data}`
  //     );
  //   }

  //   msg.ack();
  // });
});

// process.on('SIGINT', () => stan.close());
// process.on('SIGTERM', () => stan.close());

