import { ServerError } from './ServerError';

/**
 * An error that should be thrown when something goes wrong in the DAO layer.
 */
export class DaoError extends ServerError {

    public type = DaoError.type;
    public static type = 'DAO';

}
