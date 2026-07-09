function aaa() {
  var LOCAL_VAR_afsdf = '';
  function system_start() {
    widget_modal_eaopwpl5();
  }
  function system_end() {}
  function widget_modal_eaopwpl5() {
    CTX.$getModal('9fAfPtli6Yb2dkGm').open({
      onOpen() {},
    });
  }
  function widget_form_sb842h9x() {
    CTX.$ref('form_1859543501').setValue(CTX.$getGlobalVar('VAR_asdasd'));
    widget_data_table_yetwsfzl();
  }
  function widget_data_table_yetwsfzl() {
    widget_form_5gxe1mlu();
  }
  function widget_form_comp_52nzbne4() {
    LOCAL_VAR_afsdf = CTX.$ref('input_5615633834').getValue();
  }
  function widget_form_5gxe1mlu() {
    widget_form_comp_52nzbne4();
  }
  function toolkit_request_r0uv82qt() {
    CTX.$httpBizService(
      {
        key: 'em_dVQuQbrH',
        action: 'updateById',
      },
      LOCAL_VAR_afsdf,
    ).then((res) => {
      CTX.$setGlobalVar('VAR_asdasd', res);
      widget_form_exs99zkf();
    });
  }
  function widget_form_exs99zkf() {}
  system_start();
  return system_end();
}

function lo_r6kr83hg() {
  function system_start() {
    widget_data_table_g6udijfs();
  }
  function system_end() {}
  function widget_form_nq65685o() {}
  function widget_data_table_g6udijfs() {
    widget_form_nq65685o();
  }
  system_start();
  return system_end();
}

function lo_r6kr83hg() {
  function system_start() {
    widget_data_table_g6udijfs();
  }
  function system_end() {}
  function widget_form_nq65685o() {}
  function widget_data_table_g6udijfs() {
    widget_form_nq65685o();
  }
  system_start();
  return system_end();
}

function lo_ic4reolb() {
  var LOCAL_VAR_a = '';
  function system_start() {}
  function system_end() {}
  function toolkit_request_vxn4po14() {
    CTX.$httpBizService(
      {
        key: 'em_IBxbbCrd',
        action: 'listAll',
      },
      {
        a: LOCAL_VAR_a,
        b: (() => {
          console.log('aa');
          return 1;
        })(),
      },
    ).then((res) => {});
  }
  system_start();
  return system_end();
}

function lo_63leh72l() {
  function system_start() {
    widget_modal_hwxb1mag();
  }
  function system_end() {}
  function widget_modal_hwxb1mag() {
    CTX.$getModal('modal_4328458893').open({
      onOpen() {
        widget_form_comp_lqo5vk32();
      },
    });
  }
  function widget_form_comp_lqo5vk32() {
    CTX.$getCtxById().$ref('input_3537139551').setValue(CTX.$getGlobalVar('VAR_asdasd'));
    widget_form_comp_vwmva5re();
  }
  function widget_form_comp_vwmva5re() {
    CTX.$getCtxById('modal_4328458893')
      .$ref('input_8580095957')
      .setValue(CTX.$getGlobalVar('VAR_asdasd'));
  }
  system_start();
  return system_end();
}
