import * as Sentry from '@sentry/node';
import config from './config';

if (config.sentryDsn) {
    Sentry.init({
        dsn: config.sentryDsn,
        environment: process.env.ENV_ID || 'dev',
        tracesSampleRate: 1.0,
    });
}

export { Sentry };
