export type BaseErrorType = BaseError & { name: string };

export class BaseError extends Error {
  details: string;
  docsPath?: string;
  metaMessages?: string[];
  shortMessage: string;

  override name = "ClarityAbitypeError";

  constructor(
    shortMessage: string,
    options: {
      cause?: Error | unknown;
      details?: string;
      docsPath?: string;
      metaMessages?: string[];
    } = {},
  ) {
    const details =
      options.cause instanceof BaseError
        ? options.cause.details
        : options.cause instanceof Error
          ? options.cause.message
          : options.details;

    const message = [
      shortMessage || "An error occurred.",
      "",
      ...(options.metaMessages ? [...options.metaMessages, ""] : []),
      ...(options.docsPath
        ? [
            `Docs: https://github.com/pradel/clarity-abitype#${options.docsPath}`,
            "",
          ]
        : []),
      ...(details ? [`Details: ${details}`] : []),
    ]
      .join("\n")
      .trim();

    super(message, options.cause ? { cause: options.cause } : undefined);

    this.details = details ?? "";
    this.docsPath = options.docsPath;
    this.metaMessages = options.metaMessages;
    this.shortMessage = shortMessage;
  }
}

export type AbiFunctionNotFoundErrorType = AbiFunctionNotFoundError & {
  name: "AbiFunctionNotFoundError";
};

export class AbiFunctionNotFoundError extends BaseError {
  override name = "AbiFunctionNotFoundError";

  constructor(
    functionName: string,
    options: {
      access?: string;
      docsPath?: string;
    } = {},
  ) {
    super(
      `Function "${functionName}" not found in ABI${
        options.access ? ` with access "${options.access}"` : ""
      }.`,
      {
        docsPath: options.docsPath,
      },
    );
  }
}

export type AbiArgumentMismatchErrorType = AbiArgumentMismatchError & {
  name: "AbiArgumentMismatchError";
};

export class AbiArgumentMismatchError extends BaseError {
  override name = "AbiArgumentMismatchError";

  constructor({
    functionName,
    expectedCount,
    givenCount,
    docsPath,
  }: {
    functionName?: string;
    expectedCount: number;
    givenCount: number;
    docsPath?: string;
  }) {
    super(
      `Argument count mismatch${
        functionName ? ` for function "${functionName}"` : ""
      }: expected ${expectedCount}, got ${givenCount}.`,
      {
        docsPath,
      },
    );
  }
}

export type ContractExecutionErrorType = ContractExecutionError & {
  name: "ContractExecutionError";
};

export class ContractExecutionError extends BaseError {
  override name = "ContractExecutionError";

  constructor(
    cause: unknown,
    {
      contractName,
      contractAddress,
      functionName,
      docsPath,
    }: {
      contractName?: string;
      contractAddress?: string;
      functionName?: string;
      docsPath?: string;
    } = {},
  ) {
    super(
      `Execution failed for contract "${
        contractAddress ? `${contractAddress}.` : ""
      }${contractName ?? "unknown"}"${
        functionName ? ` function "${functionName}"` : ""
      }.`,
      {
        cause,
        docsPath,
      },
    );
  }
}
