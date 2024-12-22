import { Injectable, CacheInterceptor, ExecutionContext } from "@nestjs/common";

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { httpAdapter } = this.httpAdapterHost;

    if (request.method !== "GET") {
      return undefined;
    }

    return `${httpAdapter.getRequestUrl(request)}-${JSON.stringify(
      request.query
    )}`;
  }
}
