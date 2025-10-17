import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const OrgParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.orgId || request.params?.orgId;
  },
);
