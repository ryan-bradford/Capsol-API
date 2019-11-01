import { ServerError } from './ServerError';

/**
 * An error that should be thrown when there is an error in the service layer.
 */
export class ServiceError extends ServerError {

    public type = ServiceError.type;
    public static type = 'SERVICE';

}
