import { PartialType } from '@nestjs/swagger';
import { CreateTakenClassDto } from './create-taken-class.dto';

export class UpdateTakenClassDto extends PartialType(CreateTakenClassDto) {}