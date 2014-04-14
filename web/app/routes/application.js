import Participant from 'appkit/models/participant';

export default Em.Route.extend({
    setupController: function(ctrl){
        Participant.all().then(function(partitipants){
            ctrl.set('participants', partitipants);
        });
    }
});