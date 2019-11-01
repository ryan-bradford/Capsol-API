/**
 * An error that should be thrown when the created error is the fault of the client.
 */
export class ClientError extends Error {

    public type = ClientError.type;
    public static type = 'CLIENT';

}
