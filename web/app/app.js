import Resolver from 'ember/resolver';

var App = Ember.Application.extend({
  LOG_ACTIVE_GENERATION: true,
  LOG_MODULE_RESOLVER: true,
  LOG_TRANSITIONS: true,
  LOG_TRANSITIONS_INTERNAL: true,
  LOG_VIEW_LOOKUPS: true,
  modulePrefix: 'appkit', // TODO: loaded via config
  Resolver: Resolver['default'],
    STRINGS: {
        '3_days': '3 days',
        '1_week': '1 week',
        '1_month': '1 month',
        '3_months': '3 months',
        '1_year': '1 year',
        '5_years': '5 years'
    },
    NUMBERS: {
        '3_days': 1,
        '1_week': 2,
        '1_month': 3,
        '3_months': 4,
        '1_year': 5,
        '5_years': 6
    }
});

export default App;
