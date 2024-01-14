import { Module } from '@nestjs/common';
import { FarmModule } from './farm/farm.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [FarmModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}