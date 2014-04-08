// Put general configuration here. This file is included
// in both production and development BEFORE Ember is
// loaded.
//
// For example to enable a feature on a canary build you
// might do:
//
// window.ENV = {FEATURES: {'with-controller': true}};

window.ENV = window.ENV || {
    BASE_URL: 'http://localhost:8080/',
    PARTICIPANTS: [{
        fingerprint: 'F2044413DAC2E02E3D6BCF4735A19BCA1DE97281',
        name: 'gablemoo'
    },{
        fingerprint: '9695DFC35FFEB861329B9F1AB04C46397020CE31',
        name: 'morial'
    }]
};
