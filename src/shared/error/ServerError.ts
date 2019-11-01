/**
 * An error that should be thrown when the server makes an error not the client.
 */
export class ServerError extends Error {

    public type = ServerError.type;
    public static type = 'SERVER';

}
