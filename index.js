/*---------------------------------------------------------------------------------------------
 *  Copyright (c) kkChan(694643393@qq.com). All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

const soap = require('soap');

class WebServiceClient {
    constructor(url, endpoint) {
        this.URL = url;
        this.Endpoint = endpoint;
        this.Security = null;
        this.SOAPAction = null;
        this.clientCreatedHandler = null;
    }

    internal_createClient() {
        return new Promise((resolve, reject) => {
            soap.createClient(this.URL, (err, client) => {
                if(err) {
                    reject(err);
                } else {
                    this.client = client;

                    if(this.Endpoint) {
                        this.client.setEndpoint(this.Endpoint);
                    }
                    if(this.Security) {
                        this.client.setSecurity(this.Security);
                    }
                    if(this.SOAPAction) {
                        this.client.setSOAPAction(this.SOAPAction);
                    }

                    if(typeof this.clientCreatedHandler === 'function') {
                        this.clientCreatedHandler(this);
                    }

                    resolve(this.client);
                }
            });
        });
    }

    internal_invoke(method, args) {
        return new Promise((resolve, reject) => {
            if(this.client) {
                if(this.client[method]) {
                    try {
                        this.client[method](args, function(err, result) {
                            if(err) {
                                reject(err);
                            } else {
                                resolve(result);
                            }
                        });
                    } catch(err) {
                        reject(err);
                    }
                } else {
                    reject(new Error(`not found the method '${method}'`));
                }
            } else {
                reject(new Error('soap client be not initialized.'));
            }
        });
    }

    setClientCreatedHandler(handler) {
        this.clientCreatedHandler = handler;
    }

    setEndpoint(endpoint) {
        this.Endpoint = endpoint;

        if(this.client) this.client.setEndpoint(this.Endpoint = endpoint);
    }

    setSOAPAction(SOAPAction) {
        this.SOAPAction = SOAPAction;

        if(this.client) this.client.setSOAPAction(SOAPAction);
    }

    addSoapHeader(soapHeader, name, namespace, xmlns) {
        if(this.client) this.client.addSoapHeader(soapHeader, name, namespace, xmlns);
    }

    addBodyAttribute(bodyAttribute, name, namespace, xmlns) {
        if(this.client) this.client.addBodyAttribute(bodyAttribute, name, namespace, xmlns);
    }

    setSecurity(security) {
        this.Security = security;

        if(this.client) this.client.setSecurity(security);
    }

    setBasicAuthSecurity(username, password) {
        this.setSecurity(new soap.BasicAuthSecurity(username, password));
    }

    invoke(method, args) {
        return new Promise((resolve, reject) => {
            if(!this.client) {
                this.internal_createClient().then(client => {
                    this.internal_invoke(method, args).then(resolve).catch(reject);
                }).catch(err => {
                    reject(err);
                });
            } else {
                this.internal_invoke(method, args).then(resolve).catch(reject);
            }
        });
    }
}

module.exports = WebServiceClient;