import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class IsSameProfessionalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user_id = request.params.professionalId;
    const authenticatedUserId = request.user.id;

    if (user_id != authenticatedUserId) {
      throw new ForbiddenException('You are not authorized to perform this action.');
    }

    return true;
  }
}