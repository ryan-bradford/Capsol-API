/**
 * An error that should be thrown when the created error is the fault of the client.
 */
export class ClientError extends Error {
    public static type = 'CLIENT';

    public type = ClientError.type;

}
