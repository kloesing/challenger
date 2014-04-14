/*global ENV */

import ajax from 'appkit/utils/ajax';

export default function json(fileName){
  return ajax({
      dataType: 'json',
      url: ENV.BASE_URL + 'assets/json/' + fileName
  });
}
