import { ServerError } from './ServerError';

/**
 * An error that should be thrown when something goes wrong in the DAO layer.
 */
export class DaoError extends ServerError {
    public static type = 'DAO';

    public type = DaoError.type;

}
