import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class IsSameUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user_id = request.params.userId;
    const requestingUserId = request.user.id;

    // Realiza la lógica de autorización aquí...
    if (user_id !== requestingUserId) {
      throw new ForbiddenException('You are not authorized to perform this action.');
    }

    return true;
  }
}