/**
 * An error that should be thrown when the server makes an error not the client.
 */
export class ServerError extends Error {
    public static type = 'SERVER';

    public type = ServerError.type;

}
