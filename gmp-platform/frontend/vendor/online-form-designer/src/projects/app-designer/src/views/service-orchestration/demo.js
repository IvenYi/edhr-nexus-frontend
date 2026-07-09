import { ModelManager } from 'jsapi';

function main() {
  var GLOBAL_aa = '';
  function start() {
    model_create_by1qdu8h();
  }
  function end() {}
  function model_create_by1qdu8h() {
    const model = {
      f_f: 111,
    };
    GLOBAL_aa = model;
    model_submit_f3ihsr7j();
  }
  function model_submit_f3ihsr7j() {
    const id = ModelManager().save('em_dVQuQbrH', GLOBAL_aa);
  }
  start();
  return end();
}
