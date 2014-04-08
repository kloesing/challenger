var Router = Ember.Router.extend(); // ensure we don't share routes between all Router instances

Router.map(function() {
  this.route('graphs');
  this.route('about');
});

export default Router;
