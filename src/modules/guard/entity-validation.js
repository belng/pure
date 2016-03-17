import { bus, Constants } from '../../core-base';
import log from 'winston';

bus.on('change', (changes) => {
  if (!changes.entities) return;

  for (const id in changes.entities) {
		const entity = changes.entities[id];

    if (entity.create) {
      const time = Date.now();
      log.info('entity validator: ', entity);
      entity.updateTime = time;
      entity.createTime = time;
      changes.entities[id] = entity;
    }
  }
}, Constants.APP_PRIORITIES.ENTITY_VALIDATION);
