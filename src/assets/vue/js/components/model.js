window.Yii2VuexOrm = window.Yii2VuexOrm || {};
Yii2VuexOrm.Model = class extends VuexORM.Model {

    static endpoint_create;
    static endpoint_update;
    static endpoint_delete;
    static endpoint_list;
    static endpoint_view;

    _errors = {};
    _default_error_field = 'id';

    isNewRecord() {

        return this.id === null;
    }

    constructor( record ) {

        super( record );
        this.updateOldValues( record ? record : {} );
    }

    async save( request = {} ) {

        let errors = {};
        this._errors = {};

        let result = null;

        request = Yii2VuexOrm.Model._getOptions( {
            url: this.isNewRecord() ? this.constructor.endpoint_create : this.constructor.endpoint_update,
            expand: '',
            expand_name: '_expand',
            params: {},
            axios: {}
        }, request );

        let error = null;
        try {

            if ( this.isNewRecord() ) {

                if ( !request.request.url ) {

                    console.error( 'No endpoint set for a model', this );
                    throw 'No endpoint set for a model';
                }

                result = await this.constructor.api().post( request.request.url, this, request.axios_params );
            } else {

                if ( !request.request.url ) {

                    console.error( 'No endpoint set for a model', this );
                    throw 'No endpoint set for a model';
                }

                result = await this.constructor.api().put( request.request.url, this, request.axios_params );
            }
        } catch ( e ) {

            error = e;
            result = e;
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

        if ( error ) {

            throw error;
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
     * Expands default request options with the given request, also preparing axios_params options for a request.
     * @param {*} default_request
     * @param {*} request
     * @returns {{request: *, axios_params}}
     * @private
     */
    static _getOptions( default_request, request = {} ) {

        request = $.extend( default_request, request );

        let expand = request.expand;
        if ( Array.isArray( request.expand ) ) {

            expand = request.expand.join( ',' );
        }

        let get_params = request.params;

        if ( expand ) {

            let expand_obj = {};
            expand_obj[ request.expand_name ] = expand;
            get_params = $.extend( get_params, expand_obj );
        }

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

        return {
            request: request,
            axios_params: axios_params
        }
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
     * @returns {Promise<Yii2VuexOrm.Response>}
     */
    static async list( request ) {

        request = Yii2VuexOrm.Model._getOptions( {
            url: this.endpoint_list,
            expand: '',
            expand_name: 'expand',
            filter: null,
            sort: null,
            page: null,
            page_size: 5,
            params: {},
            axios: {}
        }, request );

        const result = await this.api().get( request.request.url, request.axios_params );

        return new Yii2VuexOrm.Response( request.request, result );
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
     * @param {int} id
     * @param {object} request
     * @returns {Promise<Yii2VuexOrm.Response>}
     */
    static async view( id, request = {} ) {

        request = Yii2VuexOrm.Model._getOptions( {
            url: this.endpoint_view,
            expand: '',
            expand_name: 'expand',
            filter: null,
            params: {
                id: id
            },
            axios: {}
        }, request );

        const result = await this.api().get( request.request.url, request.axios_params );

        return new Yii2VuexOrm.Response( request.request, result );
    }

    /**
     * Returns true if model has errors.
     * @returns {boolean}
     */
    hasErrors() {

        return Object.keys( this._errors ).length > 0;
    }

    /**
     * Returns all errors indexed by their field.
     * @returns {Array}
     */
    getErrors() {

        return this._errors;
    }

    /**
     * Clears all errors.
     */
    clearErrors() {

        this._errors = {};
    }

    /**
     * Returns a summary of all joined errors, using the provided separator.
     * @param {String} separator
     * @returns {String}
     */
    getErrorSummary( separator = '; ' ) {

        const errors = [];

        for ( let i in this._errors ) {

            if ( this._errors.hasOwnProperty( i ) ) {

                errors.push( this._errors[ i ] );
            }
        }

        return errors.join( '; ' );
    }

    /**
     * Stores given values as old values.
     * @param {Array|Object} attrs
     */
    updateOldValues( attrs ) {

        let old_values = {};
        for ( let i in this.constructor.fields() ) {

            old_values[ i ] = attrs[ i ];
        }

        this.$old_values = old_values;
    }

    /**
     * Checks if a given attribute has changed since it was last stored in this object.
     * @param {String} attr
     * @returns {boolean}
     */
    isDirty( attr ) {

        return this.$old_values[ attr ] !== this[ attr ];
    }

    static afterUpdate( model ) {

        model.updateOldValues( model );
    }

    static afterCreate( model ) {

        model.updateOldValues( model );
    }

    /**
     * Returns all attributes of the model as plain Object.
     * @returns {{}}
     */
    getAttributes() {

        const fields = this.constructor.fields();

        let data = {};
        for ( let i in fields ) {

            data[ i ] = this[ i ];
        }

        return data;
    }

    /**
     * Sets attributes from a given data object/array
     * @param {Object|Array} data
     * @param {boolean} is_dirty - If true, treats the changed values as dirty, otherwise as not.
     */
    setAttributes( data, is_dirty = true ) {

        const fields = this.constructor.fields();

        for ( let i in data ) {

            if ( typeof( fields[ i ] ) !== 'undefined' ) {

                this[ i ] = data[ i ];

                if ( !is_dirty ) {

                    this.$old_values[ i ] = data[i];
                }
            }
        }
    }
}