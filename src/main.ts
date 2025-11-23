import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import passport from 'passport';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/logger.config';
import { ConfigService } from '@nestjs/config';
import MongoStore from 'connect-mongo';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('PORT');
  const mongoUrl = configService.getOrThrow<string>('MONGODB_URI');
  const sessionSecret = configService.getOrThrow<string>('SESSION_SECRET');

  const localFrontendUrl = configService.getOrThrow<string>('LOCAL_FRONTEND_URL');
  const productionFrontendUrl = configService.getOrThrow<string>('PRODUCTION_FRONTEND_URL');
  const frontendUrl = process.env.NODE_ENV === 'production' ? productionFrontendUrl : localFrontendUrl;

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.enableShutdownHooks();

  const store = MongoStore.create({
    mongoUrl, 
    collectionName: 'sessions', 
    ttl: 3600000 * 12, // 12 hours
  });
  
  app.use(
    session({ 
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        maxAge: 3600000 * 12,
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      },
    })
  ); 
  
  app.use(passport.initialize());
  app.use(passport.session());

  // app.useGlobalInterceptors(new ResponseWrapperInterceptor());
  
  await app.listen(port);
}
bootstrap();