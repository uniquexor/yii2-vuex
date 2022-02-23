class Model extends VuexORM.Model {

    static endpoint_create;
    static endpoint_update;
    static endpoint_delete;
    static endpoint_list;

    _errors;
    _default_error_field = 'id';

    isNewRecord() {

        return this.id === null;
    }

    async save() {

        let errors = {};
        this._errors = {};

        let result = null;

        if ( this.isNewRecord() ) {

            if ( !this.constructor.endpoint_create ) {

                console.error( 'No endpoint set for a model', this );
                throw 'No endpoint set for a model';
            }

            result = await this.constructor.api().post( this.constructor.endpoint_create, this );
        } else {

            if ( !this.constructor.endpoint_update ) {

                console.error( 'No endpoint set for a model', this );
                throw 'No endpoint set for a model';
            }

            result = await this.constructor.api().put( this.constructor.endpoint_update, this );
        }

        if ( result.response.status === 422 ) {

            for ( let i in result.response.data ) {

                let error = result.response.data[ i ];
                errors[ error.field ] = error.message;
            }

            this._errors = errors;
        } else if ( result.response.status !== 200 && result.response.status !== 201 && this._default_error_field ) {

            errors[ this._default_error_field ] = result.response.statusText;
            this._errors = errors;
        }

        return result;
    }

    async delete() {

        if ( !this.constructor.endpoint_delete ) {

            console.error( 'No endpoint set for a model', this );
            throw 'No endpoint set for a model';
        }

        return await this.constructor.api().delete( this.constructor.endpoint_delete + '?id=' + this.id, {
            delete: this.id
        } );
    }

    /**
     * `request` can have the following options:
     * - {string} `url`: The url for the listing
     * - {string}|{array} `expand`: The relations to expand. If an array is passed, will be merged to a string, using commas.
     *                              The same as passing "expand" parameter to action/index.
     * - {object} `filter`: A filter for yii2. The same as passing a "filter" parameter to action/index. However, a new Axios ParamsSerializer will
     *                      be created to serialize the object to a query form of "filter[field]=...&filter[field_2]=..."
     * - {string} `sort`: A field to sort data by. By default sorts in ascending order. To sort in descending prepend field name with "-".
     * - {int|null} `page`: Page number
     * - {int|null} `page_size`: How many record to return in a single page.
     * - {object} `params`: Other query parameters to add to the request.
     * - {object} `axios`: Other Axios configuration values.
     * @param {object} request
     * @returns {Promise<Response | Response>}
     */
    static async list( request ) {

        const default_params = {
            url: this.endpoint_list,
            expand: '',
            filter: null,
            sort: null,
            page: null,
            page_size: 5,
            params: {},
            axios: {}
        }

        request = $.extend( default_params, request );
        let expand = request.expand;
        if ( Array.isArray( request.expand ) ) {

            expand = request.expand.join( ',' );
        }

        let get_params = $.extend( request.params, { expand: expand } );
        if ( request.page ) {

            get_params.page = request.page;
        }

        if ( request.page_size ) {

            get_params['per-page'] = request.page_size;
        }

        if ( request.filter ) {

            if ( !request.axios ) {

                request.axios = {};
            }

            if ( !request.axios.paramsSerializer ) {

                request.axios.paramsSerializer = function ( params ) {

                    return $.param( params );
                }
            }

            get_params.filter = request.filter;
        }

        if ( request.sort ) {

            get_params.sort = request.sort;
        }

        const axios_params = $.extend( request.axios, { params: get_params } );
        const result = await this.api().get( request.url, axios_params );

        return new Response( request, result );
    }
}