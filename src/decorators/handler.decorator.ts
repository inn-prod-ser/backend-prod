import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorHandlerInterceptor implements NestInterceptor {
  intercept( context: ExecutionContext, next: CallHandler ): Observable<any> {
    return next.handle().pipe(
      catchError( error => {
        if ( error instanceof NotFoundException ) {
          throw error;
        }
        throw new InternalServerErrorException( 'Error interno del servidor' );
      } ),
    );
  }
}
