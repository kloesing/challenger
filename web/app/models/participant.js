import json from 'appkit/utils/json';

var Participant = Em.Object.extend({
    fingerprint: '',
    nickname: ''
});

Participant.reopenClass({
    all: function(){
        return new Em.RSVP.Promise(function(resolve){
            json('fingerprints.json').then(function(participants){
                resolve(participants.map(function(participant){
                    return Participant.create(participant);
                }));
            });
        });
    }
});

export default Participant;