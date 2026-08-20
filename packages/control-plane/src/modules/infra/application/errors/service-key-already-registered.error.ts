export class ServiceKeyAlreadyRegisteredError extends Error {
  constructor(
    public readonly serviceKey: string,
  ) {
    super(
      `Service key already registered: ${serviceKey}`,
    );

    this.name =
      'ServiceKeyAlreadyRegisteredError';
  }
}
