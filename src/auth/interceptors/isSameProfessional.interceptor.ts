import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class IsSameProfessionalInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const professional_id = request.body.professional_id;
    const authenticatedUserId = request.user.id;

    
    if (professional_id !== authenticatedUserId) {
      throw new ForbiddenException('You are not authorized to perform this action.');
    }

    return next.handle();
  }
}