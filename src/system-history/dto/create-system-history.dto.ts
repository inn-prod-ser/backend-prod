import { IsString, IsUUID } from 'class-validator';


export class CreateSystemHistoryDto {

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsUUID()
  idRegister: string;
}
