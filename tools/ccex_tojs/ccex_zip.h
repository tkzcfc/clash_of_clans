#pragma once

#include <functional>
#include <string>

namespace ccex {
    class ZipUtil {
    public:
        static bool decompressZipAsync(const std::string& zipFile, const std::string& outDir, bool removeFile, const std::function<void(bool, std::string)>& result, const std::function<void(int, int)>& percent = nullptr);
    };
}