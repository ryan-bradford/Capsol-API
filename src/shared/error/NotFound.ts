/**
 * An error that should be thrown when a resource the client request was not found.
 */
export class NotFoundError extends Error {

    public type = NotFoundError.type;
    public static type = 'NOT_FOUND';

}
