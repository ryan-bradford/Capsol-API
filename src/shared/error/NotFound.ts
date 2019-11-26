/**
 * An error that should be thrown when a resource the client request was not found.
 */
export class NotFoundError extends Error {
    public static type = 'NOT_FOUND';

    public type = NotFoundError.type;

}
