import { PartialType } from '@nestjs/swagger';
import { CreateClassResourceDto } from './create-class-resource.dto';

export class UpdateClassResourceDto extends PartialType( CreateClassResourceDto ) { }