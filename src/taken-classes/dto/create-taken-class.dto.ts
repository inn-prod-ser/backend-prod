import { IsString } from 'class-validator';

export class CreateTakenClassDto {
  @IsString()
  courseClassId: string;
}