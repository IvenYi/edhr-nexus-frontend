import { ModelManager } from 'jsapi';

function main(argument) {
  var GLOBAL_factory = {};
  var GLOBAL_factory_id = '';
  function start() {
    model_create_xvoeozqm();
  }
  function model_create_xvoeozqm() {
    const model = {
      f_name: argument.name,
    };
    GLOBAL_factory = model;
    model_submit_pbal766s();
  }
  function model_submit_pbal766s() {
    const id = ModelManager().save('em_hoHJPMcC', GLOBAL_factory);
    GLOBAL_factory_id = id;
  }
  function end() {
    return GLOBAL_factory_id;
  }

  start();
  return end();
}
