#pragma once
#include "base/ccConfig.h"

#include "cocos/scripting/js-bindings/jswrapper/SeApi.h"

extern se::Object* __jsb_ccex_ZipUtil_proto;
extern se::Class* __jsb_ccex_ZipUtil_class;

bool js_register_ccex_ZipUtil(se::Object* obj);
bool register_all_ccex(se::Object* obj);
SE_DECLARE_FUNC(js_ccex_ZipUtil_decompressZipAsync);

