import { ServerError } from './ServerError';

/**
 * An error that should be thrown when there is an error in the service layer.
 */
export class ServiceError extends ServerError {
    public static type = 'SERVICE';

    public type = ServiceError.type;

}
