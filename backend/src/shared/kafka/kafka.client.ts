import { Kafka, type Producer, type Consumer, type Message } from 'kafkajs';
import { env } from '../../config';
import { logger } from '../logger/logger';

let kafka: Kafka | null = null;
let producer: Producer | null = null;

function getKafka(): Kafka {
  if (!kafka) {
    kafka = new Kafka({
      clientId: env.kafka.clientId,
      brokers: [env.kafka.broker],
      retry: {
        initialRetryTime: 300,
        retries: 8,
      },
    });
  }
  return kafka;
}

export async function getProducer(): Promise<Producer> {
  if (!producer) {
    const kafkaInstance = getKafka();
    producer = kafkaInstance.producer();
    await producer.connect();
    logger.info('Kafka producer connected');
  }
  return producer;
}

export async function createConsumer(groupId: string): Promise<Consumer> {
  const kafkaInstance = getKafka();
  const consumer = kafkaInstance.consumer({ groupId });
  await consumer.connect();
  logger.info('Kafka consumer connected', { groupId });
  return consumer;
}

export async function publishEvent(topic: string, event: Record<string, unknown>): Promise<void> {
  try {
    const prod = await getProducer();
    const message: Message = {
      value: JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
      }),
    };
    await prod.send({ topic, messages: [message] });
    logger.debug('Event published', { topic, eventType: event.type });
  } catch (error) {
    logger.error('Failed to publish event', error as Error, { topic });
  }
}

export async function disconnectKafka(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
    logger.info('Kafka producer disconnected');
  }
}
