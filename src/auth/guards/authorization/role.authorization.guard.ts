import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from 'src/utils/constants/roles/roles.constant';

@Injectable()
export class RoleAuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {

    // recibe la metadata que le especificamos en el controlador
    const metadataRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredRole = metadataRoles[0]
    console.log(requiredRole)

    // si no hay roles especificados, retorna true
    if (!requiredRole) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    console.log(user.user_role_id)
    // comparamos
    if (user.user_role_id !== requiredRole) {
      throw new UnauthorizedException('User does not have the required role');
    }

    return true;

  }
}