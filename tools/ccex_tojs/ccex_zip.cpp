#include "ccex.h"
#include <thread>
#include <chrono>
#include "base/CCScheduler.h"
#include "base/ccUTF8.h"
#include "platform/CCFileUtils.h"
#include "platform/CCApplication.h"
#include "unzip/unzip.h"
#include "extensions/assets-manager/CCAsyncTaskPool.h"


#define BUFFER_SIZE    8192
#define MAX_FILENAME   512

static std::string getBasename(const std::string& path)
{
	size_t found = path.find_last_of("/\\");

	if (std::string::npos != found)
	{
		return path.substr(0, found);
	}
	else
	{
		return path;
	}
}

static bool decompressZip(const std::string& zip, const std::string outDir, std::string& errorStr, void(*percentCall)(int, int, void*), void* data/* = NULL*/)
{
	std::string rootPath = outDir;

	if (rootPath.empty())
	{
		// Find root path for zip file
		size_t pos = zip.find_last_of("/\\");
		if (pos == std::string::npos)
		{
			errorStr = cocos2d::StringUtils::format("no root path specified for zip file %s\n", zip.c_str());
			return false;
		}
		rootPath = zip.substr(0, pos + 1);
	}
	if (rootPath.back() != '/' && rootPath.back() != '\\')
	{
		rootPath.push_back('/');
	}

	auto fileUtils = cocos2d::FileUtils::getInstance();

	// Open the zip file
	unzFile zipfile = cocos2d::unzOpen(fileUtils->getSuitableFOpen(zip).c_str());
	if (!zipfile)
	{
		errorStr = cocos2d::StringUtils::format("can not open downloaded zip file %s\n", zip.c_str());
		return false;
	}

	// Get info about the zip file
	cocos2d::unz_global_info global_info;
	if (cocos2d::unzGetGlobalInfo(zipfile, &global_info) != UNZ_OK)
	{
		errorStr = cocos2d::StringUtils::format("can not read file global info of %s\n", zip.c_str());
		cocos2d::unzClose(zipfile);
		return false;
	}

	// Buffer to hold data read from the zip file
	char readBuffer[BUFFER_SIZE];
	// Loop to extract all files.
	uLong i;
	for (i = 0; i < global_info.number_entry; ++i)
	{
		// Get info about current file.
		cocos2d::unz_file_info fileInfo;
		char fileName[MAX_FILENAME];
		if (cocos2d::unzGetCurrentFileInfo(zipfile,
			&fileInfo,
			fileName,
			MAX_FILENAME,
			NULL,
			0,
			NULL,
			0) != UNZ_OK)
		{
			errorStr = cocos2d::StringUtils::format("can not read compressed file info\n");
			cocos2d::unzClose(zipfile);
			return false;
		}
		const std::string fullPath = rootPath + fileName;

		// Check if this entry is a directory or a file.
		const size_t filenameLength = strlen(fileName);
		if (fileName[filenameLength - 1] == '/')
		{
			//There are not directory entry in some case.
			//So we need to create directory when decompressing file entry
			std::string dir = getBasename(fullPath);
			if (!fileUtils->isDirectoryExist(dir) && !fileUtils->createDirectory(dir))
			{
				// Failed to create directory
				errorStr = cocos2d::StringUtils::format("can not create directory %s\n", fullPath.c_str());
				cocos2d::unzClose(zipfile);
				return false;
			}
		}
		else
		{
			// Create all directories in advance to avoid issue
			std::string dir = getBasename(fullPath);
			if (!fileUtils->isDirectoryExist(dir) && !fileUtils->createDirectory(dir)) {
				// Failed to create directory
				errorStr = cocos2d::StringUtils::format("can not create directory %s\n", fullPath.c_str());
				cocos2d::unzClose(zipfile);
				return false;
			}
			// Entry is a file, so extract it.
			// Open current file.
			if (cocos2d::unzOpenCurrentFile(zipfile) != UNZ_OK)
			{
				errorStr = cocos2d::StringUtils::format("can not extract file %s\n", fileName);
				cocos2d::unzClose(zipfile);
				return false;
			}

			if (fileUtils->isFileExist(fileUtils->getSuitableFOpen(fullPath)))
			{
				fileUtils->removeFile(fileUtils->getSuitableFOpen(fullPath));
			}

			// Create a file to store current file.
			FILE* out = fopen(fileUtils->getSuitableFOpen(fullPath).c_str(), "wb");
			if (!out)
			{
				errorStr = cocos2d::StringUtils::format("can not create decompress destination file %s (errno: %d)\n", fullPath.c_str(), errno);
				cocos2d::unzCloseCurrentFile(zipfile);
				cocos2d::unzClose(zipfile);
				return false;
			}

			// Write current file content to destinate file.
			int error = UNZ_OK;
			do
			{
				error = cocos2d::unzReadCurrentFile(zipfile, readBuffer, BUFFER_SIZE);
				if (error < 0)
				{
					errorStr = cocos2d::StringUtils::format("can not read zip file %s, error code is %d\n", fileName, error);
					fclose(out);
					cocos2d::unzCloseCurrentFile(zipfile);
					cocos2d::unzClose(zipfile);
					return false;
				}

				if (error > 0)
				{
					fwrite(readBuffer, error, 1, out);
				}
			} while (error > 0);

			fclose(out);
		}

		cocos2d::unzCloseCurrentFile(zipfile);

		// Goto next entry listed in the zip file.
		if ((i + 1) < global_info.number_entry)
		{
			if (cocos2d::unzGoToNextFile(zipfile) != UNZ_OK)
			{
				errorStr = cocos2d::StringUtils::format("can not read next file for decompressing\n");
				cocos2d::unzClose(zipfile);
				return false;
			}
		}

		if (percentCall != NULL)
		{
			percentCall(i + 1, global_info.number_entry, data);
		}
	}

	cocos2d::unzClose(zipfile);
	return true;
}

namespace ccex 
{
    bool ZipUtil::decompressZipAsync(const std::string& zipFile, const std::string& outDir, bool removeFile, const std::function<void(bool, std::string)>& result, const std::function<void(int, int)>& percent)
	{
		struct AsyncData
		{
			std::string zipFile;
			std::string outDir;
			std::string error;
			bool succeed;
			std::function<void(bool, std::string)> resultCall;
			std::function<void(int, int)> percentCall;
			bool removeFile;
		};

		AsyncData* asyncData = new AsyncData;
		asyncData->zipFile = zipFile;
		asyncData->outDir = outDir;
		asyncData->succeed = false;
		asyncData->resultCall = std::move(result);
		asyncData->percentCall = std::move(percent);
		asyncData->removeFile = removeFile;


		std::function<void(void*)> decompressFinished = [](void* param) {
			auto dataInner = reinterpret_cast<AsyncData*>(param);
			if (dataInner->succeed)
			{
				if (dataInner->resultCall)
				{
					dataInner->resultCall(true, "");
				}
			}
			else
			{
				if (dataInner->resultCall)
				{
					dataInner->resultCall(false, dataInner->error);
				}
			}
			delete dataInner;
		};

		cocos2d::AsyncTaskPool::getInstance()->enqueue(cocos2d::AsyncTaskPool::TaskType::TASK_OTHER, decompressFinished, (void*)asyncData, [asyncData]() {
			void(*zipPercent)(int, int, void*) = NULL;
			if (asyncData->percentCall != nullptr)
			{
				zipPercent = [](int now, int total, void* data)
				{
					auto dataInner = reinterpret_cast<AsyncData*>(data);
					cocos2d::Application::getInstance()->getScheduler()->performFunctionInCocosThread(std::bind(dataInner->percentCall, now, total));
				};
			}

			// Decompress all compressed files
			if (decompressZip(asyncData->zipFile, asyncData->outDir, asyncData->error, zipPercent, (void*)asyncData))
			{
				asyncData->succeed = true;
				if (asyncData->removeFile)
				{	
					auto fileUtils = cocos2d::FileUtils::getInstance();
					fileUtils->removeFile(asyncData->zipFile);
				}
			}
		});

		return true;
    }
}



