import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateTokenDto {
  @ApiProperty( {
    description: 'JWT token to validate',
    example: 'eyJhbGciOi...'
  } )
  @IsString()
  @IsNotEmpty()
  token: string;
}