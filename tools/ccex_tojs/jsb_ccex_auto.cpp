#include "scripting/js-bindings/auto/jsb_ccex_auto.hpp"
#include "scripting/js-bindings/manual/jsb_conversions.hpp"
#include "scripting/js-bindings/manual/jsb_global.h"
#include "ccex/ccex.h"

se::Object* __jsb_ccex_ZipUtil_proto = nullptr;
se::Class* __jsb_ccex_ZipUtil_class = nullptr;

static bool js_ccex_ZipUtil_decompressZipAsync(se::State& s)
{
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 4) {
        std::string arg0;
        std::string arg1;
        bool arg2;
        std::function<void (bool, std::string)> arg3;
        ok &= seval_to_std_string(args[0], &arg0);
        ok &= seval_to_std_string(args[1], &arg1);
        ok &= seval_to_boolean(args[2], &arg2);
        do {
            if (args[3].isObject() && args[3].toObject()->isFunction())
            {
                se::Value jsThis(s.thisObject());
                se::Value jsFunc(args[3]);
                jsFunc.toObject()->root();
                auto lambda = [=](bool larg0, std::string larg1) -> void {
                    se::ScriptEngine::getInstance()->clearException();
                    se::AutoHandleScope hs;
        
                    CC_UNUSED bool ok = true;
                    se::ValueArray args;
                    args.resize(2);
                    ok &= boolean_to_seval(larg0, &args[0]);
                    ok &= std_string_to_seval(larg1, &args[1]);
                    se::Value rval;
                    se::Object* thisObj = jsThis.isObject() ? jsThis.toObject() : nullptr;
                    se::Object* funcObj = jsFunc.toObject();
                    bool succeed = funcObj->call(args, thisObj, &rval);
                    if (!succeed) {
                        se::ScriptEngine::getInstance()->clearException();
                    }
                };
                arg3 = lambda;
            }
            else
            {
                arg3 = nullptr;
            }
        } while(false)
        ;
        SE_PRECONDITION2(ok, false, "js_ccex_ZipUtil_decompressZipAsync : Error processing arguments");
        bool result = ccex::ZipUtil::decompressZipAsync(arg0, arg1, arg2, arg3);
        ok &= boolean_to_seval(result, &s.rval());
        SE_PRECONDITION2(ok, false, "js_ccex_ZipUtil_decompressZipAsync : Error processing arguments");
        return true;
    }
    if (argc == 5) {
        std::string arg0;
        std::string arg1;
        bool arg2;
        std::function<void (bool, std::string)> arg3;
        std::function<void (int, int)> arg4;
        ok &= seval_to_std_string(args[0], &arg0);
        ok &= seval_to_std_string(args[1], &arg1);
        ok &= seval_to_boolean(args[2], &arg2);
        do {
            if (args[3].isObject() && args[3].toObject()->isFunction())
            {
                se::Value jsThis(s.thisObject());
                se::Value jsFunc(args[3]);
                jsFunc.toObject()->root();
                auto lambda = [=](bool larg0, std::string larg1) -> void {
                    se::ScriptEngine::getInstance()->clearException();
                    se::AutoHandleScope hs;
        
                    CC_UNUSED bool ok = true;
                    se::ValueArray args;
                    args.resize(2);
                    ok &= boolean_to_seval(larg0, &args[0]);
                    ok &= std_string_to_seval(larg1, &args[1]);
                    se::Value rval;
                    se::Object* thisObj = jsThis.isObject() ? jsThis.toObject() : nullptr;
                    se::Object* funcObj = jsFunc.toObject();
                    bool succeed = funcObj->call(args, thisObj, &rval);
                    if (!succeed) {
                        se::ScriptEngine::getInstance()->clearException();
                    }
                };
                arg3 = lambda;
            }
            else
            {
                arg3 = nullptr;
            }
        } while(false)
        ;
        do {
            if (args[4].isObject() && args[4].toObject()->isFunction())
            {
                se::Value jsThis(s.thisObject());
                se::Value jsFunc(args[4]);
                jsFunc.toObject()->root();
                auto lambda = [=](int larg0, int larg1) -> void {
                    se::ScriptEngine::getInstance()->clearException();
                    se::AutoHandleScope hs;
        
                    CC_UNUSED bool ok = true;
                    se::ValueArray args;
                    args.resize(2);
                    ok &= int32_to_seval(larg0, &args[0]);
                    ok &= int32_to_seval(larg1, &args[1]);
                    se::Value rval;
                    se::Object* thisObj = jsThis.isObject() ? jsThis.toObject() : nullptr;
                    se::Object* funcObj = jsFunc.toObject();
                    bool succeed = funcObj->call(args, thisObj, &rval);
                    if (!succeed) {
                        se::ScriptEngine::getInstance()->clearException();
                    }
                };
                arg4 = lambda;
            }
            else
            {
                arg4 = nullptr;
            }
        } while(false)
        ;
        SE_PRECONDITION2(ok, false, "js_ccex_ZipUtil_decompressZipAsync : Error processing arguments");
        bool result = ccex::ZipUtil::decompressZipAsync(arg0, arg1, arg2, arg3, arg4);
        ok &= boolean_to_seval(result, &s.rval());
        SE_PRECONDITION2(ok, false, "js_ccex_ZipUtil_decompressZipAsync : Error processing arguments");
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 5);
    return false;
}
SE_BIND_FUNC(js_ccex_ZipUtil_decompressZipAsync)



static bool js_ccex_ZipUtil_finalize(se::State& s)
{
    CCLOGINFO("jsbindings: finalizing JS object %p (ccex::ZipUtil)", s.nativeThisObject());
    auto iter = se::NonRefNativePtrCreatedByCtorMap::find(s.nativeThisObject());
    if (iter != se::NonRefNativePtrCreatedByCtorMap::end())
    {
        se::NonRefNativePtrCreatedByCtorMap::erase(iter);
        ccex::ZipUtil* cobj = (ccex::ZipUtil*)s.nativeThisObject();
        delete cobj;
    }
    return true;
}
SE_BIND_FINALIZE_FUNC(js_ccex_ZipUtil_finalize)

bool js_register_ccex_ZipUtil(se::Object* obj)
{
    auto cls = se::Class::create("ZipUtil", obj, nullptr, nullptr);

    cls->defineStaticFunction("decompressZipAsync", _SE(js_ccex_ZipUtil_decompressZipAsync));
    cls->defineFinalizeFunction(_SE(js_ccex_ZipUtil_finalize));
    cls->install();
    JSBClassType::registerClass<ccex::ZipUtil>(cls);

    __jsb_ccex_ZipUtil_proto = cls->getProto();
    __jsb_ccex_ZipUtil_class = cls;

    se::ScriptEngine::getInstance()->clearException();
    return true;
}

bool register_all_ccex(se::Object* obj)
{
    // Get the ns
    se::Value nsVal;
    if (!obj->getProperty("ccex", &nsVal))
    {
        se::HandleObject jsobj(se::Object::createPlainObject());
        nsVal.setObject(jsobj);
        obj->setProperty("ccex", nsVal);
    }
    se::Object* ns = nsVal.toObject();

    js_register_ccex_ZipUtil(ns);
    return true;
}

