export class ServiceInstanceKeyAlreadyRegisteredError extends Error {
  constructor(
    public readonly instanceKey: string,
  ) {
    super(
      `Service instance key already registered: ${instanceKey}`,
    );

    this.name =
      'ServiceInstanceKeyAlreadyRegisteredError';
  }
}
