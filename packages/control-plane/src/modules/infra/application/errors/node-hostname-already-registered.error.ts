export class NodeHostnameAlreadyRegisteredError extends Error {
  constructor(
    public readonly hostname: string,
  ) {
    super(`Node hostname already registered: ${hostname}`);

    this.name = 'NodeHostnameAlreadyRegisteredError';
  }
}
