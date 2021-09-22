import { OmitType } from '@nestjs/swagger';

import { CreateAccountDto } from '../../accounts/dto/create-account.dto';

export class RegisterDto extends OmitType(CreateAccountDto, ['bio']) {}
