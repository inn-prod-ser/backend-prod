import { PartialType } from '@nestjs/swagger';

import { CreateClassContentDto } from './create-class-content.dto';

export class UpdateClassContentDto extends PartialType( CreateClassContentDto ) { }